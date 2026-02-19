// Get HTML elements
const aapl = document.getElementById("aapl");
const googl = document.getElementById("googl");
const msft = document.getElementById("msft");

// 🔑 Replace with your Twelve Data API key
const API_KEY = "eb21a3c47e2944d68b820483ca9f5739";

// Fetch stock prices from API
async function fetchStocks() {
    try {
        const url = `https://api.twelvedata.com/price?symbol=AAPL,GOOGL,MSFT&apikey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        aapl.textContent = "$ " + data.AAPL.price;
        googl.textContent = "$ " + data.GOOGL.price;
        msft.textContent = "$ " + data.MSFT.price;

    } catch (error) {
        aapl.textContent = "Error";
        googl.textContent = "Error";
        msft.textContent = "Error";
        console.error(error);
    }
}

// Load data on page load
fetchStocks();

// Auto refresh every 60 seconds
setInterval(fetchStocks, 60000);

let priceChart = null;

// Search and display stock details
async function searchStock() {
    const symbol = document.getElementById('searchBar').value.toUpperCase().trim();
    if (!symbol) return;

    try {
        // Fetch stock quote
        const quoteUrl = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`;
        const quoteResponse = await fetch(quoteUrl);
        const quoteData = await quoteResponse.json();

        if (quoteData.code === 400 || quoteData.status === 'error') {
            alert('Stock not found. Please try another symbol.');
            return;
        }

        // Fetch time series data for chart
        const timeSeriesUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${API_KEY}`;
        const timeSeriesResponse = await fetch(timeSeriesUrl);
        const timeSeriesData = await timeSeriesResponse.json();

        displayStockDetails(quoteData, timeSeriesData);
    } catch (error) {
        alert('Error fetching stock data');
        console.error(error);
    }
}

// Display stock overview and chart
function displayStockDetails(quote, timeSeries) {
    const detailsDiv = document.getElementById('stockDetails');
    const symbolEl = document.getElementById('detailSymbol');
    const infoEl = document.getElementById('detailInfo');

    symbolEl.textContent = `${quote.name} (${quote.symbol})`;
    
    infoEl.innerHTML = `
        <div class="info-grid">
            <div><strong>Price:</strong> $${quote.close}</div>
            <div><strong>Change:</strong> <span class="${parseFloat(quote.change) >= 0 ? 'positive' : 'negative'}">${quote.change} (${quote.percent_change}%)</span></div>
            <div><strong>Open:</strong> $${quote.open}</div>
            <div><strong>High:</strong> $${quote.high}</div>
            <div><strong>Low:</strong> $${quote.low}</div>
            <div><strong>Volume:</strong> ${parseInt(quote.volume).toLocaleString()}</div>
        </div>
    `;

    // Create price chart
    if (timeSeries.values) {
        const labels = timeSeries.values.reverse().map(v => v.datetime);
        const prices = timeSeries.values.map(v => parseFloat(v.close));

        const ctx = document.getElementById('priceChart').getContext('2d');
        
        if (priceChart) priceChart.destroy();
        
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: prices,
                    borderColor: '#00e676',
                    backgroundColor: 'rgba(0, 230, 118, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { ticks: { color: '#fff' }, grid: { color: '#333' } },
                    x: { ticks: { color: '#fff', maxTicksLimit: 10 }, grid: { color: '#333' } }
                }
            }
        });
    }

    detailsDiv.style.display = 'block';
}

// Close stock details
function closeDetails() {
    document.getElementById('stockDetails').style.display = 'none';
}

// Allow Enter key to search
document.getElementById('searchBar').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchStock();
});
