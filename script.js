let myChart = null;

const defaultColors = ['#FF0000', '#FFFF00', '#00FF00', '#0000FF'];

function addInput(type) {
    const inputGroup = document.getElementById(`${type}InputGroup`);
    const newInput = document.createElement('div');
    newInput.className = 'value-input';
    
    if (type === 'x') {
        newInput.innerHTML = `
            <input type="text" placeholder="X Değeri">
            <button class="add-btn" onclick="addInput('x')">+</button>
            <button class="remove-btn" onclick="removeInput('x')">-</button>
        `;
    } else {
        const colorIndex = inputGroup.children.length - 2; // Subtract 2 for h3 and initial input
        const defaultColor = colorIndex < defaultColors.length ? defaultColors[colorIndex] : `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        newInput.innerHTML = `
            <input type="text" placeholder="Y Değeri">
            <input type="color" value="${defaultColor}">
            <button class="add-btn" onclick="addInput('y')">+</button>
            <button class="remove-btn" onclick="removeInput('y')">-</button>
        `;
    }

    inputGroup.appendChild(newInput);
    updateButtons();
    addInputListeners();
    updateChart();
}

function removeInput(type) {
    const inputGroup = document.getElementById(`${type}InputGroup`);
    if (inputGroup.children.length > 2) { // h3 ve ilk input'u korumak için
        inputGroup.removeChild(inputGroup.lastElementChild);
    }
    updateButtons();
    updateChart();
}

function updateButtons() {
    const xInputs = document.querySelectorAll('#xInputGroup .value-input');
    const yInputs = document.querySelectorAll('#yInputGroup .value-input');

    xInputs.forEach((input, index) => {
        input.querySelector('.remove-btn').style.display = index === 0 && xInputs.length === 1 ? 'none' : 'inline-block';
    });

    yInputs.forEach((input, index) => {
        input.querySelector('.remove-btn').style.display = index === 0 && yInputs.length === 1 ? 'none' : 'inline-block';
    });
}

function updateChartOptions() {
    const chartType = document.getElementById('chartType').value;
    const chartOptions = document.getElementById('chartOptions');
    const barOptions = document.getElementById('barOptions');
    const scatterOptions = document.getElementById('scatterOptions');

    chartOptions.style.display = 'block';
    barOptions.style.display = chartType === 'bar' ? 'block' : 'none';
    scatterOptions.style.display = chartType === 'scatter' ? 'block' : 'none';
    updateChart();
}

document.getElementById('chartType').addEventListener('change', updateChartOptions);
document.getElementById('barThickness').addEventListener('input', function() {
    document.getElementById('barThicknessValue').textContent = this.value;
    updateChart();
});
document.getElementById('yAxisMin').addEventListener('input', updateChart);
document.getElementById('yAxisMax').addEventListener('input', updateChart);
document.getElementById('chartTitle').addEventListener('input', updateChart);

function updateChart() {
    const xInputs = document.querySelectorAll('#xInputGroup input[type="text"]');
    const yInputs = document.querySelectorAll('#yInputGroup input[type="text"]');
    const colorInputs = document.querySelectorAll('#yInputGroup input[type="color"]');

    const xValues = Array.from(xInputs).map(input => input.value.trim());
    const yValues = Array.from(yInputs).map(input => parseFloat(input.value.trim()));
    const colors = Array.from(colorInputs).map(input => input.value);

    const chartType = document.getElementById('chartType').value;
    const yAxisMin = parseFloat(document.getElementById('yAxisMin').value);
    const yAxisMax = parseFloat(document.getElementById('yAxisMax').value);
    const chartTitle = document.getElementById('chartTitle').value;

    if (myChart) {
        if (myChart instanceof ApexCharts) {
            myChart.destroy();
        } else if (myChart instanceof Chart) {
            myChart.destroy();
        }
    }

    const chartContainer = document.getElementById('chartContainer');
    
    let chartHeight = window.innerWidth <= 768 ? 300 : 350; // Mobil cihazlar için daha küçük yükseklik

    if (['spider', 'area'].includes(chartType)) {
        chartContainer.innerHTML = '<div id="chart"></div>';

        let options;

        switch (chartType) {
            case 'spider':
                options = {
                    chart: {
                        type: 'radar',
                        height: chartHeight
                    },
                    series: [{
                        name: 'Series 1',
                        data: yValues
                    }],
                    title: {
                        text: chartTitle,
                        align: 'left',
                        style: {
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }
                    },
                    xaxis: {
                        categories: xValues
                    },
                    colors: colors
                };
                myChart = new ApexCharts(document.querySelector("#chart"), options);
                myChart.render();
                break;
            case 'area':
                options = {
                    chart: {
                        type: 'area',
                        height: chartHeight
                    },
                    series: [{
                        name: 'Series 1',
                        data: yValues
                    }],
                    title: {
                        text: chartTitle,
                        align: 'left',
                        style: {
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }
                    },
                    xaxis: {
                        categories: xValues
                    },
                    colors: colors,
                    fill: {
                        opacity: 0.5
                    },
                    yaxis: {
                        min: yAxisMin,
                        max: yAxisMax
                    }
                };
                myChart = new ApexCharts(document.querySelector("#chart"), options);
                myChart.render();
                break;
        }
    } else {
        chartContainer.innerHTML = '<canvas id="myChart"></canvas>';
        const ctx = document.getElementById('myChart').getContext('2d');
        let data, chartOptions;

        const barThickness = chartType === 'bar' ? parseInt(document.getElementById('barThickness').value) / 100 : undefined;

        switch (chartType) {
            case 'pie':
            case 'doughnut':
            case 'polarArea':
                data = {
                    labels: xValues,
                    datasets: [{
                        data: yValues,
                        backgroundColor: colors,
                    }]
                };
                chartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: window.innerWidth <= 768 ? 'bottom' : 'top'
                        },
                        title: {
                            display: true,
                            text: chartTitle,
                            align: 'start',
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return `${label}${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                };
                break;
            case 'line':
                data = {
                    labels: xValues,
                    datasets: [{
                        data: yValues,
                        backgroundColor: colors,
                        borderColor: '#2c2a29',
                        borderWidth: 2,
                        pointBackgroundColor: colors,
                        pointBorderColor: colors,
                        pointRadius: 5,
                        fill: false
                    }]
                };
                chartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: chartTitle,
                            align: 'start',
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            min: yAxisMin,
                            max: yAxisMax
                        }
                    }
                };
                break;
            case 'scatter':
                data = {
                    datasets: [{
                        data: xValues.map((x, i) => ({x: parseFloat(x), y: yValues[i]})),
                        backgroundColor: colors,
                        borderColor: colors,
                        pointRadius: 5
                    }]
                };
                chartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: chartTitle,
                            align: 'start',
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            min: parseFloat(document.getElementById('xAxisMin').value),
                            max: parseFloat(document.getElementById('xAxisMax').value)
                        },
                        y: {
                            beginAtZero: true,
                            min: yAxisMin,
                            max: yAxisMax
                        }
                    }
                };
                break;
            default:
                data = {
                    labels: xValues,
                    datasets: [{
                        data: yValues,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1,
                        barPercentage: barThickness,
                    }]
                };
                chartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: chartTitle,
                            align: 'start',
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            min: yAxisMin,
                            max: yAxisMax
                        }
                    }
                };
        }

        myChart = new Chart(ctx, {
            type: chartType,
            data: data,
            options: chartOptions
        });

        // Grafik oluşturulduktan sonra boyutu ayarlayın
        myChart.canvas.parentNode.style.height = `${chartHeight}px`;
    }
}

function saveChart() {
    const chartTitle = document.getElementById('chartTitle').value || 'chart';
    const saveFormat = document.getElementById('saveFormat').value;
    const chartLink = document.createElement('a');

    switch (saveFormat) {
        case 'png':
            if (myChart instanceof ApexCharts) {
                myChart.dataURI().then(({ imgURI }) => {
                    chartLink.href = imgURI;
                    chartLink.download = `${chartTitle}.png`;
                    chartLink.click();
                });
            } else if (myChart instanceof Chart) {
                chartLink.href = myChart.toBase64Image();
                chartLink.download = `${chartTitle}.png`;
                chartLink.click();
            }
            break;
        case 'svg':
            if (myChart instanceof ApexCharts) {
                myChart.dataURI().then(({ imgURI }) => {
                    chartLink.href = imgURI;
                    chartLink.download = `${chartTitle}.svg`;
                    chartLink.click();
                });
            } else if (myChart instanceof Chart) {
                // Chart.js does not natively support SVG export
                alert('SVG export is not supported for this chart type.');
            }
            break;
        case 'csv':
            let csvContent = "data:text/csv;charset=utf-8,";
            const xInputs = document.querySelectorAll('#xInputGroup input[type="text"]');
            const yInputs = document.querySelectorAll('#yInputGroup input[type="text"]');
            
            csvContent += "X,Y\n";
            xInputs.forEach((xInput, index) => {
                csvContent += `${xInput.value},${yInputs[index].value}\n`;
            });
            
            const encodedUri = encodeURI(csvContent);
            chartLink.href = encodedUri;
            chartLink.download = `${chartTitle}.csv`;
            chartLink.click();
            break;
    }
}

function addInputListeners() {
    const inputs = document.querySelectorAll('#xInputGroup input[type="text"], #yInputGroup input[type="text"], #yInputGroup input[type="color"]');
    inputs.forEach(input => input.addEventListener('input', updateChart));
}

function resetChart() {
    document.getElementById('chartTitle').value = '';
    const xInputGroup = document.getElementById('xInputGroup');
    const yInputGroup = document.getElementById('yInputGroup');

    while (xInputGroup.children.length > 2) {
        xInputGroup.removeChild(xInputGroup.lastChild);
    }
    while (yInputGroup.children.length > 2) {
        yInputGroup.removeChild(yInputGroup.lastChild);
    }

    xInputGroup.querySelector('input[type="text"]').value = '';
    yInputGroup.querySelector('input[type="text"]').value = '';
    yInputGroup.querySelector('input[type="color"]').value = '#4BC0C0';

    document.getElementById('chartType').value = 'bar';
    document.getElementById('barThickness').value = 20;
    document.getElementById('barThicknessValue').textContent = '%20';
    document.getElementById('yAxisMin').value = 0;
    document.getElementById('yAxisMax').value = 100;
    document.getElementById('xAxisMin').value = 0;
    document.getElementById('xAxisMax').value = 100;

    updateButtons();
    updateChartOptions();
    updateChart();
}

function updateBarThickness() {
    const thickness = document.getElementById('barThickness').value;
    document.getElementById('barThicknessValue').textContent = `%${thickness}`;
    updateChart();
}

function zoomIn() {
    if (myChart instanceof Chart) {
        myChart.zoom(1.1);
    } else if (myChart instanceof ApexCharts) {
        // ApexCharts için zoom işlevi
    }
}

function zoomOut() {
    if (myChart instanceof Chart) {
        myChart.zoom(0.9);
    } else if (myChart instanceof ApexCharts) {
        // ApexCharts için zoom işlevi
    }
}

function resetZoom() {
    if (myChart instanceof Chart) {
        myChart.resetZoom();
    } else if (myChart instanceof ApexCharts) {
        // ApexCharts için zoom sıfırlama işlevi
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyonlar
window.onload = function() {
    updateButtons();
    updateChartOptions();
    addInputListeners();
    updateChart();

    // Mobil cihazlar için dokunmatik olayları
    let touchStartX = 0;
    let touchEndX = 0;
    
    const chartContainer = document.getElementById('chartContainer');
    
    chartContainer.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
    }, false);
    
    chartContainer.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        if (touchEndX < touchStartX) {
            // Sola kaydırma
            zoomOut();
        }
        if (touchEndX > touchStartX) {
            // Sağa kaydırma
            zoomIn();
        }
    }
};

// Pencere boyutu değiştiğinde grafik boyutunu güncelle
window.addEventListener('resize', function() {
    if (myChart) {
        updateChart();
    }
});

// Renk seçici için özel işlev
function updateColor(event) {
    const colorInput = event.target;
    const valueInput = colorInput.previousElementSibling;
    valueInput.style.borderColor = colorInput.value;
    updateChart();
}

// Renk seçicilere olay dinleyicileri ekle
document.querySelectorAll('#yInputGroup input[type="color"]').forEach(colorInput => {
    colorInput.addEventListener('input', updateColor);
});

// Veri girişlerini dışa aktarma işlevi
function exportData() {
    const xInputs = document.querySelectorAll('#xInputGroup input[type="text"]');
    const yInputs = document.querySelectorAll('#yInputGroup input[type="text"]');
    let data = "X,Y\n";
    
    xInputs.forEach((xInput, index) => {
        const xValue = xInput.value.trim();
        const yValue = yInputs[index].value.trim();
        data += `${xValue},${yValue}\n`;
    });
    
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "chart_data.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Veri içe aktarma işlevi
function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const contents = e.target.result;
        const lines = contents.split('\n');
        
        // Başlık satırını atla
        lines.shift();
        
        const xInputGroup = document.getElementById('xInputGroup');
        const yInputGroup = document.getElementById('yInputGroup');
        
        // Mevcut girişleri temizle
        while (xInputGroup.children.length > 2) {
            xInputGroup.removeChild(xInputGroup.lastChild);
        }
        while (yInputGroup.children.length > 2) {
            yInputGroup.removeChild(yInputGroup.lastChild);
        }
        
        // İlk girişi doldur
        const firstLine = lines[0].split(',');
        xInputGroup.querySelector('input[type="text"]').value = firstLine[0];
        yInputGroup.querySelector('input[type="text"]').value = firstLine[1];
        
        // Kalan satırlar için yeni girişler oluştur ve doldur
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',');
            addInput('x');
            addInput('y');
            
            const xInputs = xInputGroup.querySelectorAll('input[type="text"]');
            const yInputs = yInputGroup.querySelectorAll('input[type="text"]');
            
            xInputs[xInputs.length - 1].value = values[0];
            yInputs[yInputs.length - 1].value = values[1];
        }
        
        updateChart();
    };
    
    reader.readAsText(file);
}

// Dosya yükleme input'una olay dinleyicisi ekle
document.getElementById('importFile').AddEventListener('change', importData);