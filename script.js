document.addEventListener('DOMContentLoaded', function () {

    const path = window.location.pathname;
    const page = path.split("/").pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === page) link.classList.add('active');
    });

    const greeting = document.getElementById('userGreeting');
    if (greeting) {
        const savedName = localStorage.getItem('username');
        if (savedName) {
            greeting.innerText = `Welcome back, ${savedName}`;
        }
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "AUTHENTICATING...";
            btn.style.opacity = "0.7";
            localStorage.setItem('loggedIn', 'true');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button');
            btn.innerText = "CREATING ACCOUNT...";
            btn.style.opacity = "0.7";
            localStorage.setItem('loggedIn', 'true');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        });
    }

    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
        let streak = parseInt(localStorage.getItem('streakCount') || '0');
        const lastCheckIn = localStorage.getItem('lastCheckInDate');
        const today = new Date().toDateString();
        document.getElementById('streakDisplay').innerText = streak;
        if (lastCheckIn === today) {
            disableCheckIn(checkInBtn);
        }
        checkInBtn.addEventListener('click', function () {
            streak++;
            localStorage.setItem('streakCount', streak);
            localStorage.setItem('lastCheckInDate', today);
            document.getElementById('streakDisplay').innerText = streak;
            disableCheckIn(this);
        });
    }

    function disableCheckIn(btn) {
        btn.innerText = "COMPLETED";
        btn.disabled = true;
        btn.style.backgroundColor = "transparent";
        btn.style.color = "var(--accent)";
        btn.style.border = "1px solid var(--accent)";
        btn.style.cursor = "default";
    }

    const waterFill = document.getElementById('waterBarFill');
    if (waterFill) {
        let waterCount = parseInt(localStorage.getItem('waterCount') || '0');
        const maxWater = 10;
        const waterText = document.getElementById('waterText');

        function updateWater() {
            if (!waterText) return;
            waterText.innerText = `${waterCount} / ${maxWater}`;
            const pct = (waterCount / maxWater) * 100;
            waterFill.style.width = `${Math.min(pct, 100)}%`;
            localStorage.setItem('waterCount', waterCount);
        }

        updateWater();

        window.addWater = function () { if (waterCount < 15) { waterCount++; updateWater(); } };
        window.removeWater = function () { if (waterCount > 0) { waterCount--; updateWater(); } };
    }

    const addFoodBtn = document.getElementById('addFoodBtn');
    if (addFoodBtn) {
        loadFoodLog();
        addFoodBtn.addEventListener('click', function () {
            const item = document.getElementById('foodName').value;
            const cals = parseInt(document.getElementById('foodCals').value);
            if (item && cals) {
                const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
                foodLog.push({ item, cals, id: Date.now() });
                localStorage.setItem('foodLog', JSON.stringify(foodLog));
                document.getElementById('foodName').value = '';
                document.getElementById('foodCals').value = '';
                renderFoodLog(foodLog);
            }
        });
    }

    function loadFoodLog() {
        const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
        renderFoodLog(foodLog);
    }

    function renderFoodLog(log) {
        const list = document.getElementById('foodListBody');
        const totalDisplay = document.getElementById('totalCalsDisplay');
        if (!list) return;
        list.innerHTML = '';
        let total = 0;
        log.forEach(entry => {
            total += entry.cals;
            const row = `
<tr>
<td>${entry.item}</td>
<td style="text-align:right">${entry.cals} kcal</td>
<td style="text-align:right">
<button class="btn-delete" onclick="deleteFood(${entry.id})">X</button>
</td>
</tr>
`;
            list.innerHTML += row;
        });
        if (totalDisplay) totalDisplay.innerText = total;
    }

    window.deleteFood = function (id) {
        let foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
        foodLog = foodLog.filter(f => f.id !== id);
        localStorage.setItem('foodLog', JSON.stringify(foodLog));
        renderFoodLog(foodLog);
    }

    const bmiBtn = document.getElementById('calculateBmiBtn');
    if (bmiBtn) {
        bmiBtn.addEventListener('click', function () {
            const w = parseFloat(document.getElementById('weight').value);
            const h = parseFloat(document.getElementById('height').value);
            if (w && h) {
                const bmi = (w / ((h / 100) ** 2)).toFixed(1);
                document.getElementById('bmiValue').innerText = bmi;
                document.getElementById('bmiResultArea').style.display = 'block';
                let pct = ((bmi - 15) / 25) * 100;
                if (pct < 0) pct = 0;
                if (pct > 100) pct = 100;
                const marker = document.getElementById('bmiMarker');
                if (marker) marker.style.left = `${pct}%`;
                let msg = "";
                let color = "";
                if (bmi < 18.5) { msg = "Underweight"; color = "#4FC3F7"; }
                else if (bmi < 25) { msg = "Normal Weight"; color = "#66BB6A"; }
                else if (bmi < 30) { msg = "Overweight"; color = "#FFA726"; }
                else { msg = "Obese"; color = "#EF5350"; }
                const catText = document.getElementById('bmiCategory');
                if (catText) {
                    catText.innerText = msg;
                    catText.style.color = color;
                }
            }
        });
    }

    const logWorkoutBtn = document.getElementById('logWorkoutBtn');
    if (logWorkoutBtn) {
        loadWorkouts();
        logWorkoutBtn.addEventListener('click', function () {
            const type = document.getElementById('wType').value;
            const min = document.getElementById('wDuration').value;
            if (type && min) {
                const logs = JSON.parse(localStorage.getItem('workoutLogs') || '[]');
                const date = new Date().toLocaleDateString();
                logs.unshift({ date, type, min, id: Date.now() });
                localStorage.setItem('workoutLogs', JSON.stringify(logs));
                document.getElementById('wDuration').value = '';
                renderWorkouts(logs);
            }
        });
    }

    function loadWorkouts() {
        const logs = JSON.parse(localStorage.getItem('workoutLogs') || '[]');
        renderWorkouts(logs);
    }

    function renderWorkouts(logs) {
        const container = document.getElementById('workoutLogContainer');
        if (!container) return;
        container.innerHTML = '';
        logs.slice(0, 5).forEach(log => {
            const div = document.createElement('div');
            div.style.padding = "15px";
            div.style.borderBottom = "1px solid var(--border)";
            div.innerHTML = `
<div style="display:flex; justify-content:space-between; color:white;">
<strong>${log.type}</strong>
<span>${log.min} min</span>
</div>
<div style="font-size:0.75rem; color:var(--text-light); margin-top:5px;">${log.date}</div>
`;
            container.appendChild(div);
        });
    }

});

window.resetApp = function () {
    if (confirm("Are you sure you want to wipe all data? This cannot be undone.")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}
