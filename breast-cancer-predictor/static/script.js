document.addEventListener("DOMContentLoaded", function () {
  const themeBtn = document.getElementById("themeToggle");
  const form = document.getElementById("predictionForm");
  const resultBox = document.getElementById("resultBox");
  const resultContent = document.getElementById("resultContent");
  const loader = document.querySelector(".loader");
  const chartContainer = document.querySelector(".chart-container");
  const chartCanvas = document.getElementById("predictionChart");
  const inputs = document.querySelectorAll("input");
  let myChart = null;

  // Initialize particles
  initParticles();
  
  // Load and apply saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
  } else {
    document.body.classList.add("light-mode");
    themeBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
  }

  // Theme toggle
  themeBtn.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      themeBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
    } else {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      themeBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
    
    // Update chart colors if it exists
    if (myChart) {
      updateChartColors();
    }
  });

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    // Hide previous results
    resultBox.classList.remove("visible");
    chartContainer.classList.remove("visible");
    
    // Show loader
    loader.style.display = "flex";
    
    // Prepare data
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = Number(value);
    }

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - in a real app, this would be from your backend
      const mockResponse = {
        prediction: Math.random() > 0.5 ? 2 : 4,
        probabilities: {
          benign: Math.random() * 0.5 + 0.5,
          malignant: Math.random() * 0.5
        }
      };
      
      // Hide loader
      loader.style.display = "none";
      
      // Display result
      displayResult(mockResponse);
    } catch (error) {
      loader.style.display = "none";
      resultContent.innerHTML = `<div class="malignant">❌ Error: ${error.message || "Failed to get prediction"}</div>`;
      resultBox.classList.add("visible");
    }
  });

  // Input field animations
  inputs.forEach(input => {
    input.addEventListener("focus", function() {
      this.parentElement.querySelector("label").style.color = "var(--primary)";
    });
    
    input.addEventListener("blur", function() {
      const isDark = document.body.classList.contains("dark-mode");
      const color = isDark ? "var(--muted-text)" : "var(--dark-muted-text)";
      this.parentElement.querySelector("label").style.color = color;
    });
    
    // Add pulsing animation when value is entered
    input.addEventListener("input", function() {
      if (this.value) {
        this.style.boxShadow = "0 0 15px rgba(138, 43, 226, 0.4)";
        setTimeout(() => {
          this.style.boxShadow = "";
        }, 1000);
      }
    });
  });

  // Display result function
  function displayResult(result) {
    if (result.prediction === 2) {
      resultContent.innerHTML = `
        <div class="benign">
          <i class="fas fa-check-circle"></i>
          <strong>Benign Tumor Detected</strong>
          <p>Low risk of breast cancer</p>
          <div class="confidence">Confidence: ${(result.probabilities.benign * 100).toFixed(1)}%</div>
        </div>
      `;
    } else {
      resultContent.innerHTML = `
        <div class="malignant">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>Malignant Tumor Detected</strong>
          <p>High risk of breast cancer</p>
          <div class="confidence">Confidence: ${(result.probabilities.malignant * 100).toFixed(1)}%</div>
        </div>
      `;
    }
    
    // Show result box with animation
    resultBox.classList.add("visible");
    
    // Show chart
    showChart(result);
    
    // Animate the result box
    setTimeout(() => {
      resultBox.style.transform = "translateY(0)";
      resultBox.style.opacity = "1";
    }, 100);
  }

  // Show chart function
  function showChart(result) {
    const ctx = chartCanvas.getContext("2d");
    
    // Destroy previous chart if exists
    if (myChart) {
      myChart.destroy();
    }
    
    // Chart data
    const data = {
      labels: ["Benign", "Malignant"],
      datasets: [{
        data: [
          result.prediction === 2 ? result.probabilities.benign : 0.01,
          result.prediction === 4 ? result.probabilities.malignant : 0.01
        ],
        backgroundColor: ["#52b788", "#e63946"],
        borderWidth: 0,
        hoverOffset: 15
      }]
    };
    
    // Chart config
    const config = {
      type: "doughnut",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: getChartLabelColor(),
              font: {
                size: 14,
                family: "'Poppins', sans-serif"
              },
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${(context.parsed * 100).toFixed(1)}%`;
              }
            }
          }
        },
        cutout: "65%",
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500
        }
      }
    };
    
    // Create chart
    myChart = new Chart(ctx, config);
    
    // Show chart container
    chartContainer.classList.add("visible");
  }
  
  // Update chart colors based on theme
  function updateChartColors() {
    if (myChart) {
      myChart.options.plugins.legend.labels.color = getChartLabelColor();
      myChart.update();
    }
  }
  
  // Get appropriate label color based on theme
  function getChartLabelColor() {
    // Get the computed style of the CSS variables from the :root element
    const rootStyles = getComputedStyle(document.documentElement);
    
    // Check for dark mode and return the corresponding computed color value
    return document.body.classList.contains("dark-mode") 
      ? rootStyles.getPropertyValue('--light-text').trim()
      : rootStyles.getPropertyValue('--dark-text').trim();
  }
  
  // Initialize floating particles
  function initParticles() {
    const particles = document.querySelectorAll(".particles");
    particles.forEach(particle => {
      // Randomize initial positions
      const randomX = Math.random() * 80 + 10;
      const randomY = Math.random() * 80 + 10;
      particle.style.left = `${randomX}%`;
      particle.style.top = `${randomY}%`;
      
      // Randomize size
      const size = Math.random() * 100 + 50;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Randomize animation duration
      const duration = Math.random() * 10 + 15;
      particle.style.animationDuration = `${duration}s`;
    });
  }
});

// Voice input function
window.startSequentialVoice = function () {
  const inputs = Array.from(document.querySelectorAll("#predictionForm input"));
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();
  
  // Show voice listening indicator
  const voiceBtn = document.querySelector(".voice-btn");
  voiceBtn.innerHTML = '<i class="fas fa-microphone-alt"></i><span>Listening...</span>';
  voiceBtn.style.background = "linear-gradient(135deg, #ff006e, #ff7e5f)";
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const numbers = transcript.match(/\d+/g);
    
    if (numbers && numbers.length >= inputs.length) {
      inputs.forEach((input, index) => {
        let value = parseInt(numbers[index]);
        if (value > 10) value = 10;
        if (value < 1) value = 1;
        
        input.value = value;
        input.dispatchEvent(new Event("input"));
      });
      
      // Success indicator
      voiceBtn.innerHTML = '<i class="fas fa-check"></i><span>Success!</span>';
      voiceBtn.style.background = "linear-gradient(135deg, #52b788, #40916c)";
    } else {
      // Error indicator
      voiceBtn.innerHTML = '<i class="fas fa-times"></i><span>Try Again</span>';
      voiceBtn.style.background = "linear-gradient(135deg, #e63946, #d00000)";
      alert(`Please speak ${inputs.length} numbers clearly.`);
    }
    
    // Reset button after delay
    setTimeout(() => {
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Voice Input</span>';
      voiceBtn.style.background = "linear-gradient(135deg, var(--accent), #3a86ff)";
    }, 2000);
  };

  recognition.onerror = (e) => {
    alert("Voice recognition error: " + e.error);
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Voice Input</span>';
    voiceBtn.style.background = "linear-gradient(135deg, var(--accent), #3a86ff)";
  };
};

// Reset form function
window.resetForm = function() {
  document.getElementById("predictionForm").reset();
  document.getElementById("resultBox").classList.remove("visible");
  document.querySelector(".chart-container").classList.remove("visible");
  
  // Animate reset
  const resetBtn = document.querySelector(".reset-btn");
  resetBtn.innerHTML = '<i class="fas fa-check"></i><span>Reset!</span>';
  resetBtn.style.background = "linear-gradient(135deg, #52b788, #40916c)";
  
  setTimeout(() => {
    resetBtn.innerHTML = '<i class="fas fa-rotate-left"></i><span>Reset</span>';
    const isDark = document.body.classList.contains("dark-mode");
    resetBtn.style.background = isDark 
      ? "var(--glass)" 
      : "var(--light-glass)";
  }, 1500);
};