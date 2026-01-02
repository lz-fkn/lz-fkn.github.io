
const canvas = document.getElementById('weather-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

window.weatherType = 'none';

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (window.weatherType !== 'none') createParticles();
}

window.addEventListener('resize', resize);
resize();


async function initWeather() {
    try {
        // Kaliningrad, RU
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=54.71&longitude=20.51&current=weather_code,snowfall,rain');
        const data = await response.json();
        const code = data.current.weather_code;

        // WMO Weather Codes: 
        // 51-67: Rain/Drizzle | 71-77: Snow | 80-82: Rain Showers | 85-86: Snow Showers
        if ([71, 73, 75, 77, 85, 86].includes(code)) {
            window.weatherType = 'snow';
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
            window.weatherType = 'rain';
        }

        console.log(`Detected Weather Code: ${code} (${window.weatherType})`);
        
        if (window.weatherType !== 'none') {
            startAnimation();
        }
    } catch (e) { 
        console.error("Weather data fetch failed. Use forceWeather('snow') to test locally.", e); 
    }
}

window.forceWeather = function(type) {
    window.weatherType = type;
    if (type === 'none') {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = [];
    } else {
        startAnimation();
    }
    console.log(`Weather manually set to: ${type}`);
};

function startAnimation() {
    createParticles();
    if (animationId) cancelAnimationFrame(animationId);
    animate();
}

function createParticles() {
    const count = window.weatherType === 'rain' ? 150 : 100;
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vel: window.weatherType === 'rain' ? Math.random() * 5 + 8 : Math.random() * 1.5 + 1,
            size: window.weatherType === 'rain' ? 1.5 : Math.random() * 3 + 1,
            drift: window.weatherType === 'snow' ? Math.random() * 1 - 0.5 : 0
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = window.weatherType === 'rain' ? 'rgba(174, 194, 224, 0.6)' : 'white';
    
    particles.forEach(p => {
        ctx.beginPath();
        if (window.weatherType === 'rain') {
            ctx.fillRect(p.x, p.y, 1, p.vel);
        } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        p.y += p.vel;
        p.x += p.drift;

        if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
        }
    });
    animationId = requestAnimationFrame(animate);
}

initWeather();