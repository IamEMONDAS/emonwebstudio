/**
 * ==========================================================================
 * HEARTORY - PREMIUM FRONTEND LOGIC & PRICING ENGINE
 * ==========================================================================
 */

// 1. PRICING CONFIGURATION 
const pricing = {
    base: { basic: 199, premium: 399, luxury: 699 },
    pages: { "1-2": 0, "3-5": 80, "6-10": 180, "11-15": 350 },
    handwritten: 120,
    addons: { 
        perfume: 499, 
        customGift: 299, 
        extraChoco: 99, 
        photo: 30 
    },
    courier: 99,
    personalPackaging: { basic: 99, premium: 199, luxury: 349 }
};

// 2. STATE MANAGEMENT
const state = {
    mode: 'boxes', 
    baseTier: 'basic', 
    pagesCount: 1,
    letterType: 'printed', 
    addons: { perfume: false, customGift: false, extraChoco: false, photo: false },
    deliveryMode: 'someone',
    letterContents: {} 
};

// 3. MAIN APPLICATION LOGIC
const app = {

    init() {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) loader.classList.add('hidden');
        }, 1200); 

        this.renderTabs();
        this.calculateAndRender();
    },

    // --- MODE SWITCHING ---
    setMode(newMode) {
        state.mode = newMode;
        
        document.getElementById('btnMode1').classList.toggle('active', newMode === 'boxes');
        document.getElementById('btnMode2').classList.toggle('active', newMode === 'personal');
        
        const secBoxes = document.getElementById('sectionBoxes');
        const secPersonal = document.getElementById('sectionPersonal');

        if (newMode === 'boxes') {
            secBoxes.classList.remove('hidden');
            secPersonal.classList.add('hidden');
        } else {
            secBoxes.classList.add('hidden');
            secPersonal.classList.remove('hidden');
        }

        this.selectBase('basic');
    },

    // --- BASE TIER SELECTION ---
    selectBase(tier) {
        state.baseTier = tier;
        
        document.querySelectorAll('#sectionBoxes .option-card, #sectionPersonal .option-card').forEach(el => {
            el.classList.remove('active');
        });

        const prefix = state.mode === 'boxes' ? 'box-' : 'pack-';
        document.getElementById(prefix + tier).classList.add('active');

        this.calculateAndRender();
    },

    // --- PAGES & LETTERS ---
    updatePages() {
        let count = parseInt(document.getElementById('pageCount').value);
        if (isNaN(count) || count < 1) count = 1;
        if (count > 15) count = 15;
        document.getElementById('pageCount').value = count;
        
        state.pagesCount = count;
        this.renderTabs();
        this.calculateAndRender();
    },

    selectLetterType(type) {
        state.letterType = type;
        document.getElementById('letter-printed').classList.remove('active');
        document.getElementById('letter-handwritten').classList.remove('active');
        document.getElementById(`letter-${type}`).classList.add('active');
        this.calculateAndRender();
    },

    renderTabs() {
        const header = document.getElementById('tabsHeader');
        const body = document.getElementById('tabsBody');
        
        for (let i = 1; i <= 15; i++) {
            const textarea = document.getElementById(`letter-page-${i}`);
            if (textarea) state.letterContents[i] = textarea.value;
        }

        header.innerHTML = '';
        body.innerHTML = '';

        for (let i = 1; i <= state.pagesCount; i++) {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${i === 1 ? 'active' : ''}`;
            btn.innerText = `Page 0${i}`.slice(-2);
            btn.onclick = () => this.switchTab(i);
            header.appendChild(btn);

            const panel = document.createElement('div');
            panel.className = `tab-panel ${i === 1 ? 'active' : ''}`;
            panel.id = `panel-${i}`;
            panel.innerHTML = `<textarea id="letter-page-${i}" placeholder="Begin page ${i} of your story here..." style="min-height: 150px;">${state.letterContents[i] || ''}</textarea>`;
            body.appendChild(panel);
        }
    },

    switchTab(pageNum) {
        document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
            btn.classList.toggle('active', idx === pageNum - 1);
        });
        document.querySelectorAll('.tab-panel').forEach((panel, idx) => {
            panel.classList.toggle('active', idx === pageNum - 1);
        });
    },

    // --- ADD-ONS ---
    toggleAddon(addonId) {
        state.addons[addonId] = !state.addons[addonId];
        document.getElementById(`addon-${addonId}`).classList.toggle('active', state.addons[addonId]);
        this.calculateAndRender();
    },

    // --- DELIVERY MODE ---
    setDeliveryMode(mode) {
        state.deliveryMode = mode;
        const isSelf = mode === 'self';
        
        document.getElementById('lblRecName').innerText = isSelf ? 'Your Full Name' : 'Recipient Name';
        document.getElementById('lblRecPhone').innerText = isSelf ? 'Your Phone Number' : 'Recipient Phone';
        document.getElementById('lblRecAddress').innerText = isSelf ? 'Your Delivery Address' : 'Destination Address';
    },

    // --- PRICING ENGINE & RENDER ---
    getPagePricing() {
        const c = state.pagesCount;
        if (c >= 1 && c <= 2) return pricing.pages["1-2"];
        if (c >= 3 && c <= 5) return pricing.pages["3-5"];
        if (c >= 6 && c <= 10) return pricing.pages["6-10"];
        if (c >= 11 && c <= 15) return pricing.pages["11-15"];
        return 0;
    },

    calculateAndRender() {
        const basePrice = state.mode === 'boxes' 
            ? pricing.base[state.baseTier] 
            : pricing.personalPackaging[state.baseTier];

        const pagesPrice = this.getPagePricing();
        const handwritingPrice = state.letterType === 'handwritten' ? pricing.handwritten : 0;
        const totalLetterPrice = pagesPrice + handwritingPrice;

        let totalAddonsPrice = 0;
        if (state.addons.perfume) totalAddonsPrice += pricing.addons.perfume;
        if (state.addons.customGift) totalAddonsPrice += pricing.addons.customGift;
        if (state.addons.extraChoco) totalAddonsPrice += pricing.addons.extraChoco;
        if (state.addons.photo) totalAddonsPrice += pricing.addons.photo;

        const grandTotal = basePrice + totalLetterPrice + totalAddonsPrice + pricing.courier;

        // --- UPDATE RECEIPT UI ---
        const baseStr = state.baseTier.charAt(0).toUpperCase() + state.baseTier.slice(1);
        document.getElementById('sumBaseLabel').innerText = state.mode === 'boxes' ? `${baseStr} Box` : `${baseStr} Packing`;
        document.getElementById('sumBasePrice').innerText = `₹${basePrice}`;

        document.getElementById('sumPagesLabel').innerText = `${state.pagesCount} Page(s) (${state.letterType.charAt(0).toUpperCase() + state.letterType.slice(1)})`;
        document.getElementById('sumPagesPrice').innerText = `₹${totalLetterPrice}`;

        document.getElementById('sumAddonPrice').innerText = `₹${totalAddonsPrice}`;
        document.getElementById('sumTotal').innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

        state.finalTotal = grandTotal;
    },

    // --- BULLETPROOF INSTAGRAM CHECKOUT WITH INSTRUCTIONS ---
    checkoutInstagram() {
        // 1. Grab HTML elements
        const elName = document.getElementById('recName');
        const elPhone = document.getElementById('recPhone');
        const elAddress = document.getElementById('recAddress');

        const rName = elName.value.trim();
        const rPhone = elPhone.value.trim();
        const rAddress = elAddress.value.trim();

        // 2. Visual Validation (Red Boxes)
        let isValid = true;
        const errorColor = '#FF4D4D';
        const defaultColor = 'var(--border-color)';

        if (!rName) { elName.style.borderColor = errorColor; isValid = false; } else { elName.style.borderColor = defaultColor; }
        if (!rPhone) { elPhone.style.borderColor = errorColor; isValid = false; } else { elPhone.style.borderColor = defaultColor; }
        if (!rAddress) { elAddress.style.borderColor = errorColor; isValid = false; } else { elAddress.style.borderColor = defaultColor; }

        if (!isValid) {
            const btn = document.getElementById('orderBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '⚠️ Please fill delivery details';
            btn.style.background = errorColor;
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = 'transparent';
            }, 3000);
            
            document.getElementById('lblRecName').scrollIntoView({behavior: 'smooth', block: 'center'});
            return;
        }

        // 3. Build Text Message
        let msg = `*✨ Heartory - A New Story Begins ✨*\n\n`;

        if (state.mode === 'boxes') {
            msg += `*Canvas:* Curated Gift Box (${state.baseTier.toUpperCase()})\n`;
        } else {
            const itemDesc = document.getElementById('personalItemDesc').value || 'Not specified';
            const itemInst = document.getElementById('personalItemInst').value || 'None';
            msg += `*Canvas:* My Personal Gift\n`;
            msg += `*Item:* ${itemDesc}\n`;
            msg += `*Notes:* ${itemInst}\n`;
            msg += `*Presentation:* ${state.baseTier.toUpperCase()}\n`;
        }

        msg += `\n*Words:* ${state.pagesCount} Page(s) [${state.letterType.toUpperCase()}]\n`;
        
        let activeAddons = [];
        if(state.addons.perfume) activeAddons.push('Luxury Perfume');
        if(state.addons.customGift) activeAddons.push('Custom Mini-Gift');
        if(state.addons.extraChoco) activeAddons.push('Extra Chocolates');
        if(state.addons.photo) activeAddons.push('Extra Polaroid');
        
        msg += `*Upgrades:* ${activeAddons.length > 0 ? activeAddons.join(', ') : 'None'}\n`;

        msg += `\n*Destination:* ${state.deliveryMode === 'self' ? 'Deliver to Me' : 'Deliver to Loved One'}\n`;
        msg += `----------------------------\n`;
        msg += `*TOTAL VALUE: ₹${state.finalTotal.toLocaleString('en-IN')}*\n`;
        msg += `----------------------------\n\n`;

        msg += `*Coordinates:*\n`;
        msg += `Name: ${rName}\n`;
        msg += `Phone: ${rPhone}\n`;
        msg += `Address: ${rAddress}\n`;

        // 4. Instructional UI & Redirect Function
        const btn = document.getElementById('orderBtn');
        const originalText = btn.innerHTML;

        const triggerRedirect = () => {
            btn.innerHTML = '📋 Copied! Redirecting...';
            
            // Create the instruction box
            const instructionBox = document.createElement('div');
            instructionBox.id = 'copyInstruction';
            instructionBox.innerHTML = `
                <div style="background: #FDFBF7; color: var(--text-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; font-size: 0.95rem; border: 1px solid var(--accent-gold); box-shadow: 0 4px 15px rgba(200, 169, 126, 0.2); animation: fadeUp 0.3s ease;">
                    <strong style="color: var(--accent-gold);"><i class="fa-solid fa-check-circle"></i> Order Details Copied!</strong><br><br>
                    Opening Instagram now... Just click <b>Message</b>, hit <b>Paste</b>, and <b>Send</b> it to us!
                </div>
            `;
            
            // Insert it right above the secure text line
            const secureText = document.querySelector('.secure-text');
            btn.parentNode.insertBefore(instructionBox, secureText);

            // Wait 3.5 seconds so they can read the instructions, then redirect
            setTimeout(() => {
                window.location.href = "https://instagram.com/heartorygifts";
                
                // Clean up the UI in case they hit the back button
                setTimeout(() => { 
                    btn.innerHTML = originalText; 
                    if(document.getElementById('copyInstruction')) {
                        document.getElementById('copyInstruction').remove();
                    }
                }, 2000);
            }, 3500); 
        };

        // 5. Execute Copy and Redirect
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(msg).then(triggerRedirect);
        } else {
            // Fallback for older browsers
            let textArea = document.createElement("textarea");
            textArea.value = msg;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                triggerRedirect();
            } catch (err) {
                alert("Your browser blocked the auto-copy. Please DM us your details on Instagram manually!");
                window.location.href = "https://instagram.com/heartorygifts";
            }
            textArea.remove();
        }
    }
};

// Initialize Application
app.init();
