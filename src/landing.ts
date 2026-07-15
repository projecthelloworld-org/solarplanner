import solarPlannerLogoUrl from "./assets/solar_planner_logo.svg";
import helloWorldMarkUrl from "./assets/hello-world-mark.svg";
import heroImageUrl from "./assets/phw-tools-hero.jpeg";
import hubosPreviewUrl from "./assets/hubos-dashboard-placeholder.webp";
import "./landing.css";

const app = document.querySelector<HTMLDivElement>("#landing-app");

if (app) {
  app.innerHTML = `
    <div class="tools-site">
      <header class="tools-header">
        <a class="tools-brand" href="/" aria-label="Project Hello World tools home">
          <img src="${helloWorldMarkUrl}" alt="" />
          <span>
            <strong>Hello World Tools</strong>
            <small>Open tools for communities</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#tools">Tools</a>
          <a href="#open-source">Open source</a>
          <a href="#partner-tools">Partner tools</a>
          <a class="header-action" href="/solar/">Open Solar Planner</a>
        </nav>
      </header>

      <main>
        <section class="hero-band" aria-labelledby="hero-title">
          <img class="hero-image" src="${heroImageUrl}" alt="" />
          <div class="hero-inner">
            <p class="eyebrow">Built openly. Used locally.</p>
            <h1 id="hero-title">Open tools for community infrastructure.</h1>
            <p class="hero-copy">
              Practical tools from Project Hello World to help communities and partners plan, adapt, and maintain the systems behind meaningful connectivity.
            </p>
            <div class="hero-actions">
              <a class="primary-action" href="/solar/">Plan a solar system</a>
              <a class="secondary-action" href="#open-source">Why open source</a>
            </div>
            <ul class="hero-facts" aria-label="Project principles">
              <li><strong>Free to use</strong><span>No account or subscription</span></li>
              <li><strong>Made to adapt</strong><span>Use assumptions that fit your context</span></li>
              <li><strong>Grounded in practice</strong><span>Shaped by community infrastructure work</span></li>
            </ul>
          </div>
        </section>

        <section class="tools-band" id="tools" aria-labelledby="tools-title">
          <div class="section-heading">
            <p class="eyebrow">Project Hello World tools</p>
            <h2 id="tools-title">Practical tools for connected communities.</h2>
            <p>Plan resilient power systems with Hello Solar Planner and keep Hello Hub infrastructure visible with HubOS.</p>
          </div>

          <article class="tool-feature">
            <div class="tool-copy">
              <div class="tool-identity">
                <img src="${solarPlannerLogoUrl}" alt="" />
                <span>01 / Energy planning</span>
              </div>
              <h3>Hello Solar Planner</h3>
              <p>
                Turn a list of routers, access points, devices, and site loads into a transparent solar estimate. Compare Fully DC and Hybrid DC + AC systems, adjust equipment and local pricing, then export a report for technical review.
              </p>
              <ul class="capability-list">
                <li>Load-driven battery, array, controller, and inverter sizing</li>
                <li>Editable equipment, costs, currency, and assumptions</li>
                <li>Adequacy warnings, PDF reports, and CSV exports</li>
                <li>Projects stay in the browser by default</li>
              </ul>
              <div class="tool-actions">
                <a class="primary-action" href="/solar/">Open Solar Planner</a>
                <a class="text-action" href="https://os.myhellohub.org/helloworld/solar_planner">View the source code</a>
              </div>
            </div>

            <div class="planner-preview" aria-label="Live preview of Hello Solar Planner">
              <div class="preview-bar">
                <span>Live tool preview</span>
                <a href="/solar/">Open full screen</a>
              </div>
              <iframe src="/solar/" title="Hello Solar Planner preview" loading="lazy"></iframe>
            </div>
          </article>

          <article class="tool-feature hubos-tool-feature" id="hubos">
            <div class="tool-copy">
              <div class="tool-identity">
                <img src="${helloWorldMarkUrl}" alt="" />
                <span>02 / Community operations</span>
              </div>
              <h3>HubOS</h3>
              <p>
                An open, modular community infrastructure operating system that connects infrastructure telemetry, field operations, community evidence, educational use, and partner action so distributed connectivity sites can be operated and improved responsibly.
              </p>
              <ul class="capability-list">
                <li>One operating view across connectivity, power, devices, field work, and community value</li>
                <li>Turns signals and requests into assigned actions, evidence, and verified follow-up</li>
                <li>Integrates established tools including ODK, UniFi, power telemetry, device management, and Metabase</li>
                <li>Low-bandwidth aware, role-scoped, interoperable, and responsible by design</li>
              </ul>
              <p class="hubos-verbs">Monitor · Understand · Improve · Protect · Prove</p>
              <div class="tool-actions hubos-actions">
                <a class="secondary-action" href="https://os.myhellohub.org/helloworld" target="_blank" rel="noreferrer">View the source code</a>
              </div>
            </div>

            <div class="planner-preview hubos-preview" aria-label="Preview of the HubOS containerized setup">
              <div class="preview-bar">
                <span>HubOS product preview</span>
                <em>Containerized setup</em>
              </div>
              <img src="${hubosPreviewUrl}" alt="HubOS containerized setup with a Docker deployment and monitoring dashboard" />
            </div>
          </article>
        </section>

        <section class="open-band" id="open-source" aria-labelledby="open-title">
          <div class="open-intro">
            <p class="eyebrow">Our open-source philosophy</p>
            <h2 id="open-title">Useful tools should travel farther than one project.</h2>
            <p>We publish the method as well as the result so others can understand it, change it, and build on it.</p>
          </div>
          <div class="principles-grid">
            <article>
              <span>01</span>
              <h3>Open by default</h3>
              <p>Partners can inspect the assumptions, understand the calculations, and deploy the software themselves.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Adaptable locally</h3>
              <p>Communities can change equipment, prices, currencies, and planning defaults to reflect local conditions.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Improved together</h3>
              <p>Field experience can become shared improvements, documentation, and new tools for other communities.</p>
            </article>
          </div>
          <a class="secondary-action" href="https://os.myhellohub.org/helloworld/solar_planner">Explore the GitLab project</a>
        </section>

        <section class="partners-band" id="partner-tools" aria-labelledby="partners-title">
          <div class="partners-heading">
            <div>
              <p class="eyebrow">Open-source partner tools</p>
              <h2 id="partners-title">Good tools grow through collaboration.</h2>
            </div>
            <p>Useful open-source projects from organisations working on community connectivity, local infrastructure, and digital inclusion.</p>
          </div>

          <div class="partners-grid">
            <a class="partner-card partner-card-active" href="https://locnet.io/" target="_blank" rel="noreferrer">
              <span class="partner-index">01 / Network planning</span>
              <h3>Community Network Builder</h3>
              <p>Estimate the cost of building and operating a community network, model different access technologies, and adjust terrain, demand, labour, and market assumptions.</p>
              <span class="partner-link">Open locnet.io <span aria-hidden="true">&#8599;</span></span>
            </a>

            <article class="partner-card partner-card-placeholder">
              <span class="partner-index">02 / Open slot</span>
              <h3>Partner tool coming soon</h3>
              <p>This space is reserved for another open-source tool that supports community-led connectivity or infrastructure.</p>
            </article>

            <article class="partner-card partner-card-placeholder">
              <span class="partner-index">03 / Open slot</span>
              <h3>Partner tool coming soon</h3>
              <p>This space is reserved for another practical project that communities and partners can inspect, adapt, and deploy.</p>
            </article>
          </div>
        </section>

        <section class="future-band" aria-labelledby="future-title">
          <div>
            <p class="eyebrow">What comes next</p>
            <h2 id="future-title">A growing toolkit for community infrastructure.</h2>
          </div>
          <p>We are continually researching, testing, and building practical tools that extend digital inclusion and strengthen community infrastructure. This collection will keep growing as that work develops, so check back for new releases and updates.</p>
        </section>
      </main>

      <footer class="tools-footer">
        <div>
          <strong>Project Hello World Tools</strong>
          <span>Open tools for practical community connectivity.</span>
        </div>
        <div class="footer-links">
          <a href="/solar/">Solar Planner</a>
          <a href="https://os.myhellohub.org/helloworld/solar_planner">Source</a>
          <a href="https://www.projecthelloworld.org/">Project Hello World</a>
          <a href="https://myhellohub.org/">My Hello Hub</a>
        </div>
      </footer>
    </div>
  `;
}
