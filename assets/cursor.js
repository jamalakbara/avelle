/**
 * Cinematic Custom Cursor
 */

document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.createElement('div');
  cursor.classList.add('custom-cursor');
  document.body.appendChild(cursor);

  const follower = document.createElement('div');
  follower.classList.add('cursor-follower');
  document.body.appendChild(follower);

  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

  // Movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Instant movement for the small dot
    cursor.style.left = mouseX - 5 + 'px';
    cursor.style.top = mouseY - 5 + 'px';
  });

  // Smooth follower (GSAP or RequestAnimationFrame)
  setInterval(() => {
    posX += (mouseX - posX) / 9;
    posY += (mouseY - posY) / 9;

    follower.style.left = posX - 15 + 'px';
    follower.style.top = posY - 15 + 'px';
  }, 10);

  // Hover States
  const links = document.querySelectorAll('a, button, .magnetic-btn');

  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      follower.classList.add('active');
    });
    link.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      follower.classList.remove('active');
    });
  });
});
