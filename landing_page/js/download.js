/**
 * HabitFlow Download Page - Interactive JavaScript
 */

// ========== Platform Detection ==========
function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
    } else if (/android/.test(userAgent)) {
        return 'android';
    } else if (/mac/.test(platform)) {
        return 'macos';
    } else if (/win/.test(platform)) {
        return 'windows';
    } else if (/linux/.test(platform)) {
        return 'linux';
    }
    return 'web';
}

// ========== Auto-highlight Detected Platform ==========
document.addEventListener('DOMContentLoaded', () => {
    const detectedPlatform = detectPlatform();
    const platformCards = document.querySelectorAll('.platform-card');
    
    platformCards.forEach(card => {
        const title = card.querySelector('.platform-title').textContent.toLowerCase();
        
        if (
            (detectedPlatform === 'ios' && title.includes('ios')) ||
            (detectedPlatform === 'android' && title.includes('android')) ||
            (detectedPlatform === 'macos' && title.includes('macos')) ||
            (detectedPlatform === 'windows' && title.includes('windows')) ||
            (detectedPlatform === 'linux' && title.includes('linux'))
        ) {
            // Add recommended badge if not web app
            if (!card.classList.contains('featured')) {
                const badge = document.createElement('div');
                badge.className = 'platform-badge';
                badge.style.background = 'var(--primary)';
                badge.textContent = 'Recommended for You';
                card.appendChild(badge);
                card.classList.add('recommended');
                
                // Scroll to this card
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    });
});

// ========== Guide Tabs ==========
const guideTabs = document.querySelectorAll('.guide-tab');
const guidePanels = document.querySelectorAll('.guide-panel');

guideTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        
        // Remove active class from all tabs and panels
        guideTabs.forEach(t => t.classList.remove('active'));
        guidePanels.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding panel
        tab.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    });
});

// ========== FAQ Accordion ==========
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(i => {
            i.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ========== Download Button Click Tracking ==========
document.querySelectorAll('.platform-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.platform-card');
        const platform = card.querySelector('.platform-title').textContent;
        
        // Show download toast
        showToast(`Starting download for ${platform}...`, 'success');
        
        // Track download (if analytics is set up)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download_start', {
                'platform': platform,
                'location': 'download_page'
            });
        }
        
        console.log(`Download initiated for: ${platform}`);
    });
});

// ========== Toast Notification ==========
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Toast styles
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--primary)' : 'var(--secondary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        animation: slideInUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }
    
    .platform-card.recommended {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
`;
document.head.appendChild(toastStyle);

// ========== Copy Download Link ==========
function copyDownloadLink(platform) {
    const url = `${window.location.origin}/download/${platform}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Download link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy link', 'error');
    });
}

// Add copy buttons to platform cards
document.querySelectorAll('.platform-card').forEach(card => {
    const platform = card.querySelector('.platform-title').textContent.toLowerCase();
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-icon-copy';
    copyBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
    `;
    copyBtn.title = 'Copy download link';
    copyBtn.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-light);
    `;
    
    copyBtn.addEventListener('mouseenter', () => {
        copyBtn.style.borderColor = 'var(--primary)';
        copyBtn.style.color = 'var(--primary)';
    });
    
    copyBtn.addEventListener('mouseleave', () => {
        copyBtn.style.borderColor = 'var(--border)';
        copyBtn.style.color = 'var(--text-light)';
    });
    
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyDownloadLink(platform);
    });
    
    card.style.position = 'relative';
    card.appendChild(copyBtn);
});

// ========== System Requirements Checker ==========
function checkSystemRequirements() {
    const requirements = {
        browser: {
            supported: true,
            name: 'Unknown'
        },
        storage: false,
        performance: false
    };
    
    // Check browser
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) {
        requirements.browser.name = 'Chrome';
        requirements.browser.supported = true;
    } else if (ua.includes('Firefox')) {
        requirements.browser.name = 'Firefox';
        requirements.browser.supported = true;
    } else if (ua.includes('Safari')) {
        requirements.browser.name = 'Safari';
        requirements.browser.supported = true;
    } else if (ua.includes('Edge')) {
        requirements.browser.name = 'Edge';
        requirements.browser.supported = true;
    }
    
    // Check storage
    if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
            const available = estimate.quota - estimate.usage;
            requirements.storage = available > 200 * 1024 * 1024; // 200MB
        });
    }
    
    // Check performance (basic)
    requirements.performance = navigator.hardwareConcurrency >= 2;
    
    return requirements;
}

// ========== Auto-select Best Platform Tab ==========
setTimeout(() => {
    const platform = detectPlatform();
    let targetTab = 'web';
    
    if (platform === 'ios' || platform === 'android') {
        targetTab = 'mobile';
    } else if (platform === 'windows' || platform === 'macos' || platform === 'linux') {
        targetTab = 'desktop';
    }
    
    const tab = document.querySelector(`[data-tab="${targetTab}"]`);
    if (tab && !document.querySelector('.guide-tab.active')) {
        tab.click();
    }
}, 100);

// ========== Platform Card Hover Effect ==========
document.querySelectorAll('.platform-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ========== Keyboard Shortcuts ==========
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus FAQ
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const faqSection = document.querySelector('.faq');
        if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Ctrl/Cmd + D to go to download section
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const platformsSection = document.querySelector('.platforms');
        if (platformsSection) {
            platformsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// ========== Load Analytics (if available) ==========
if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
        'page_title': 'Download Page',
        'page_location': window.location.href,
        'page_path': window.location.pathname
    });
}

// ========== Show Keyboard Shortcuts Hint ==========
setTimeout(() => {
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--text-light); padding: 0.5rem 1rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); position: fixed; bottom: 1rem; left: 1rem; z-index: 1000; animation: fadeIn 0.5s ease;">
            💡 <strong>Tip:</strong> Press <kbd style="padding: 0.125rem 0.375rem; background: var(--background); border: 1px solid var(--border); border-radius: 0.25rem; font-family: monospace;">Ctrl+D</kbd> to jump to downloads
        </div>
    `;
    document.body.appendChild(hint);
    
    // Remove after 5 seconds
    setTimeout(() => {
        hint.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => hint.remove(), 500);
    }, 5000);
}, 2000);

// Add fade animations
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
    }
`;
document.head.appendChild(fadeStyle);

console.log('📥 Download page initialized!');
console.log('🖥️  Detected platform:', detectPlatform());
