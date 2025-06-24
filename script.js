async function checkPassword() {
    const password = document.getElementById("password").value;
    const strengthBar = document.getElementById("strength-bar");
    const strengthMessage = document.getElementById("strength-message");
    const breachWarning = document.getElementById("breach-warning");
    
    // Update requirements in real-time
    updateRequirement("length", password.length >= 8);
    updateRequirement("uppercase", /[A-Z]/.test(password));
    updateRequirement("lowercase", /[a-z]/.test(password));
    updateRequirement("number", /[0-9]/.test(password));
    updateRequirement("special", /[^A-Za-z0-9]/.test(password));
    
    // Strength Calculation
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update strength bar and message
    let strengthClass = "";
    let strengthWidth = "0%";
    let strengthText = "";
    
    switch (strength) {
        case 0:
        case 1:
            strengthClass = "weak";
            strengthWidth = "30%";
            strengthText = "WEAK SECURITY";
            break;
        case 2:
            strengthClass = "medium";
            strengthWidth = "60%";
            strengthText = "MODERATE SECURITY";
            break;
        case 3:
        case 4:
            strengthClass = "strong";
            strengthWidth = "100%";
            strengthText = "STRONG SECURITY";
            break;
    }
    
    strengthBar.style.width = strengthWidth;
    strengthBar.className = "cyber-strength-bar " + strengthClass;
    strengthMessage.className = "cyber-strength-message " + strengthClass;
    strengthMessage.innerText = strengthText;
    
    // Check if password has been pwned using HIBP
    if (password.length > 0) {
        const sha1 = await sha1Hash(password);
        const prefix = sha1.substring(0, 5);
        const suffix = sha1.substring(5).toUpperCase();
        
        try {
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const text = await response.text();
            const lines = text.split('\n');
            let found = false;
            
            for (const line of lines) {
                const [hashSuffix, count] = line.trim().split(':');
                if (hashSuffix === suffix) {
                    breachWarning.innerText = `⚠️ WARNING: THIS PASSWORD APPEARS IN ${count} DATA BREACHES!`;
                    breachWarning.style.display = "block";
                    breachWarning.style.borderColor = "var(--cyber-red)";
                    breachWarning.style.color = "var(--cyber-red)";
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                breachWarning.innerText = "✅ NO KNOWN BREACHES DETECTED";
                breachWarning.style.display = "block";
                breachWarning.style.borderColor = "var(--cyber-green)";
                breachWarning.style.color = "var(--cyber-green)";
            }
        } catch (error) {
            breachWarning.innerText = "⚠️ UNABLE TO VERIFY BREACH STATUS";
            breachWarning.style.display = "block";
            breachWarning.style.borderColor = "var(--cyber-yellow)";
            breachWarning.style.color = "var(--cyber-yellow)";
        }
    } else {
        breachWarning.style.display = "none";
    }
}

function updateRequirement(id, isValid) {
    const element = document.getElementById(id);
    if (isValid) {
        element.classList.add("valid");
    } else {
        element.classList.remove("valid");
    }
}

function togglePassword() {
    const passwordField = document.getElementById("password");
    const eyeIcon = document.querySelector(".cyber-eye");
    
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.textContent = "👁";
    } else {
        passwordField.type = "password";
        eyeIcon.textContent = "👁";
    }
}

// SHA-1 Hash Function
async function sha1Hash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}