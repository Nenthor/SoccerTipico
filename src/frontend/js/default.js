//Mobile menu
const nav_list = document.getElementById('nav_list');
const nav_toggle = document.getElementById('nav_toggle');
const nav_bar = document.getElementsByClassName('nav_bar');

let isOpen = false;

nav_toggle.addEventListener('click', () => {
    changeMenu(!isOpen);
    if (isOpen) {
        rotateBar(0, 0, 1);
        rotateBar(1, 0, 1);
        rotateBar(2, 0, 1);
    } else {
        rotateBar(0, 1, 1);
        rotateBar(1, 0, 0);
        rotateBar(2, -1, 1);
    }
    isOpen = !isOpen;
}, { passive: true });

function rotateBar(index, factor, opacity) {
    const deg = 45 * factor, y = 13 * factor;

    nav_bar[index].style.opacity = `${opacity}`;
    nav_bar[index].style.transform =
        `rotate(${deg}deg) translateY(${y}px) `;
}

function changeMenu(visible) {
    //Reset Animation
    nav_list.style.animation = 'none';
    nav_list.offsetHeight;
    nav_list.style.animation = null;

    //Play Animation
    if (visible) {
      nav_list.style.display = 'flex';
      nav_list.style.animation = 'mobileMenu 0.6s ease-in-out 0s 1 reverse forwards';
    } else {
      nav_list.style.animation = 'mobileMenu 0.6s ease-in-out 0s 1 normal forwards';
        setTimeout(() => {
          nav_list.style = null;
        }, 600);
    }
}

//footer
const footer_text = document.getElementById('footer_text');
footer_text.textContent += ` | ${new Date().getFullYear()}`;
