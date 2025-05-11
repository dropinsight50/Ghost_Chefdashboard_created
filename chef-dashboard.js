// Chef Dashboard specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    const dashboardWelcomeName = document.getElementById('dashboardWelcomeName');
    const profileForm = document.getElementById('chef-profile-form');

    // Populate user-specific elements from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('kitchenShareLoggedInUser'));
    if (loggedInUser && loggedInUser.userType === 'chef') {
        const userName = loggedInUser.fullName || 'Chef';
        const userFirstName = userName.split(' ')[0];

        if (document.getElementById('dashboardUserNameTop')) {
            document.getElementById('dashboardUserNameTop').textContent = userName;
        }
        if (dashboardWelcomeName) {
            dashboardWelcomeName.textContent = userName;
        }
        // Assuming a default avatar or logic to fetch/set avatarUrl
        // if (document.getElementById('dashboardUserAvatarTop') && loggedInUser.avatarUrl) {
        //     document.getElementById('dashboardUserAvatarTop').src = loggedInUser.avatarUrl;
        // }
        // if (document.getElementById('profileUserAvatar') && loggedInUser.avatarUrl) {
        //     document.getElementById('profileUserAvatar').src = loggedInUser.avatarUrl;
        // }

        // Populate profile form
        if (profileForm) {
            const nameParts = userName.split(' ');
            if (document.getElementById('profileFirstName')) document.getElementById('profileFirstName').value = nameParts[0] || '';
            if (document.getElementById('profileLastName')) document.getElementById('profileLastName').value = nameParts.slice(1).join(' ') || '';
            if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = loggedInUser.email || '';
            // Add other profile fields if they exist in loggedInUser object
            // e.g., document.getElementById('profilePhone').value = loggedInUser.phone || '';
        }

    } else if (loggedInUser && loggedInUser.userType !== 'chef') {
        // This case should ideally be handled by script.js global protection
        window.location.href = 'owner-dashboard.html'; // or index.html
    } else {
        // This case should ideally be handled by script.js global protection
        window.location.href = 'login.html';
    }


    // Handle sidebar navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            contentSections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            if (sectionTitle) {
                sectionTitle.textContent = this.querySelector('span').textContent;
            }
        });
    });

    // Handle "View all" link in Recommended Kitchens section
    const recommendedViewAllLink = document.querySelector('a[data-section-link="find-kitchens"]');
    if (recommendedViewAllLink) {
        recommendedViewAllLink.addEventListener('click', function(e) {
            e.preventDefault();
            const findKitchensMenuItem = document.querySelector('.sidebar-item[data-section="find-kitchens"]');
            if (findKitchensMenuItem) {
                findKitchensMenuItem.click();
            }
        });
    }

    // FAQ Accordion
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');

            if (content.style.display === "block") {
                content.style.display = "none";
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                // Optional: Close other open FAQs
                // document.querySelectorAll('.faq-content').forEach(c => c.style.display = 'none');
                // document.querySelectorAll('.faq-toggle i').forEach(i => {
                //     i.classList.remove('fa-chevron-up');
                //     i.classList.add('fa-chevron-down');
                // });

                content.style.display = "block";
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
    
    // Set current year in footer
    const footerCurrentYear = document.getElementById('footerCurrentYear');
    if (footerCurrentYear) {
        footerCurrentYear.textContent = new Date().getFullYear();
    }

    // Profile Form Submission (Placeholder)
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would handle saving the profile data, e.g., to localStorage or an API
            alert('Profile changes saved (simulated)!');
            
            // Update localStorage if necessary
            const loggedInUser = JSON.parse(localStorage.getItem('kitchenShareLoggedInUser'));
            if (loggedInUser) {
                loggedInUser.fullName = `${document.getElementById('profileFirstName').value} ${document.getElementById('profileLastName').value}`;
                // Update other fields as needed
                // loggedInUser.phone = document.getElementById('profilePhone').value;
                localStorage.setItem('kitchenShareLoggedInUser', JSON.stringify(loggedInUser));

                // Update header display name
                if (document.getElementById('dashboardUserNameTop')) {
                    document.getElementById('dashboardUserNameTop').textContent = loggedInUser.fullName;
                }
                 if (dashboardWelcomeName) {
                    dashboardWelcomeName.textContent = loggedInUser.fullName;
                }
            }
        });
    }
});
