const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* =========================
   1. TYPING ANIMATION
========================= */

const typing = $("#typing");

const roles = [
  "Full Stack Developer",
  "Java Developer",
  "Problem Solver",
  "Frontend Engineer"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typing) return;

  const word = roles[roleIndex];

  typing.textContent = deleting
    ? word.slice(0, --charIndex)
    : word.slice(0, ++charIndex);

  if (!deleting && charIndex === word.length) {
    deleting = true;
    setTimeout(typeLoop, 1200);
    return;
  }

  if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }

  setTimeout(typeLoop, deleting ? 45 : 75);
}

if (typing) typeLoop();


/* =========================
   2. HEADER & SCROLL
========================= */

const header = $("#header");
const topBtn = $("#topBtn");
const progress = $("#progressBar");

window.addEventListener("scroll", () => {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 30);
  }

  if (topBtn) {
    topBtn.classList.toggle("show", window.scrollY > 500);
  }

  if (progress) {
    const max =
      document.documentElement.scrollHeight - window.innerHeight;

    progress.style.width =
      `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }

  const sections = $$("main section[id]");
  let current = "home";

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 180) {
      current = section.id;
    }
  });

  $$(".nav a").forEach(a => {
    a.classList.toggle(
      "active",
      a.getAttribute("href") === "#" + current
    );
  });
});

if (topBtn) {
  topBtn.onclick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
}


/* =========================
   3. MOBILE NAVIGATION
========================= */

const menuBtn = $("#menuBtn");
const nav = $("#nav");

if (menuBtn && nav) {
  menuBtn.onclick = () => {
    nav.classList.toggle("open");
  };
}

$$(".nav a").forEach(a => {
  a.onclick = () => {
    if (nav) nav.classList.remove("open");
  };
});


/* =========================
   4. SCROLL REVEAL ANIMATION
========================= */

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  $$(".reveal").forEach(el => observer.observe(el));
} else {
  $$(".reveal").forEach(el => el.classList.add("visible"));
}


/* =========================
   5. ANIMATED COUNTERS
========================= */

const counters = $$(".metric strong");
const aboutPanel = $(".about-panel");

if (aboutPanel && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;

    counters.forEach(el => {
      const target = Number(el.dataset.count);

      if (!Number.isFinite(target)) return;

      let n = 0;
      const step = Math.max(1, Math.ceil(target / 45));

      const tick = () => {
        n = Math.min(target, n + step);
        el.textContent = n;

        if (n < target) {
          requestAnimationFrame(tick);
        }
      };

      tick();
    });

    counterObserver.disconnect();
  }, {
    threshold: 0.4
  });

  counterObserver.observe(aboutPanel);
}


/* =========================
   6. PROJECT FILTER
========================= */

$$(".filter").forEach(btn => {
  btn.onclick = () => {
    $$(".filter").forEach(b => {
      b.classList.remove("active");
    });

    btn.classList.add("active");

    const filter = btn.dataset.filter;

    $$(".project-card").forEach(card => {
      const categories = (
        card.dataset.category || ""
      ).split(/\s+/);

      const shouldHide =
        filter !== "all" && !categories.includes(filter);

      card.classList.toggle("hidden", shouldHide);
    });
  };
});


/* =========================
   7. DARK / LIGHT THEME
========================= */

const themeBtn = $("#themeBtn");

if (themeBtn) {
  themeBtn.onclick = () => {
    document.body.classList.toggle("light");

    const icon = $("#themeBtn i");

    if (icon) {
      icon.className = document.body.classList.contains("light")
        ? "fa-solid fa-sun"
        : "fa-solid fa-moon";
    }
  };
}


/* =========================
   8. CURSOR GLOW
========================= */

const glow = $(".cursor-glow");

if (glow) {
  document.addEventListener("mousemove", event => {
    glow.style.left = event.clientX + "px";
    glow.style.top = event.clientY + "px";
  });
}


/* =========================
   9. CONTACT FORM
   Spring Boot API connection
========================= */

const contactForm = $("#contactForm");
const formStatus = $("#formStatus");

if (contactForm && formStatus) {

  contactForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nameInput = contactForm.querySelector(
      'input[placeholder="Your name"]'
    );

    const emailInput = contactForm.querySelector(
      'input[type="email"]'
    );

    const subjectInput = contactForm.querySelector(
      'input[placeholder="What would you like to discuss?"]'
    );

    const messageInput = contactForm.querySelector("textarea");

    if (
      !nameInput ||
      !emailInput ||
      !subjectInput ||
      !messageInput
    ) {
      formStatus.textContent =
        "Contact form fields could not be found.";

      return;
    }

    const contactData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      subject: subjectInput.value.trim(),
      message: messageInput.value.trim()
    };

    if (
      !contactData.name ||
      !contactData.email ||
      !contactData.subject ||
      !contactData.message
    ) {
      formStatus.textContent =
        "Please fill in all fields.";

      return;
    }

    const submitButton = contactForm.querySelector(
      'button[type="submit"]'
    );

    const originalButtonHTML = submitButton
      ? submitButton.innerHTML
      : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
    }

    formStatus.textContent = "Sending your message...";

    try {
      const response = await fetch(
        "http://localhost:8080/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(contactData)
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to send your message."
        );
      }

      formStatus.textContent =
        result.message ||
        "Your message has been saved successfully!";

      formStatus.classList.add("success");
      formStatus.classList.remove("error");

      contactForm.reset();

    } catch (error) {
      console.error("Contact form error:", error);

      formStatus.textContent =
        "Message failed. Please check your backend connection and try again.";

      formStatus.classList.add("error");
      formStatus.classList.remove("success");

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
      }
    }
  });
}


/* =========================
   10. FOOTER YEAR
========================= */

const year = $("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}