import solarPlannerLogoUrl from "./assets/solar_planner_logo.svg";
import "./landing.css";

const app = document.querySelector<HTMLDivElement>("#landing-app");

if (app) {
  app.innerHTML = `
    <div class="tools-site">
      <header class="tools-header">
        <a class="tools-brand" href="/" aria-label="Project Hello World tools home">
          <img src="${solarPlannerLogoUrl}" alt="" />
          <span>
            <strong>Project Hello World</strong>
            <small>Open community tools</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#tools">Tools</a>
          <a href="#open-source">Open source</a>
          <a class="header-action" href="/solar/">Open Solar Planner</a>
        </nav>
      </header>

      <main>
        <section class="hero-band" aria-labelledby="hero-title">
          <div class="hero-inner">
            <p class="eyebrow">Practical infrastructure planning</p>
            <h1 id="hero-title">Tools for communities building connected futures.</h1>
            <p class="hero-copy">
              Project Hello World develops practical, open tools that help local teams plan, adapt, and maintain the infrastructure behind community connectivity.
            </p>
            <div class="hero-actions">
              <a class="primary-action" href="/solar/">Plan a solar system</a>
              <a class="secondary-action" href="#open-source">Why open source</a>
            </div>
            <ul class="hero-facts" aria-label="Project principles">
              <li><strong>Free to use</strong><span>No accounts or subscriptions</span></li>
              <li><strong>Built for adaptation</strong><span>Editable local assumptions</span></li>
              <li><strong>Community-minded</strong><span>Designed around field realities</span></li>
            </ul>
          </div>
        </section>

        <section class="tools-band" id="tools" aria-labelledby="tools-title">
          <div class="section-heading">
            <p class="eyebrow">Available now</p>
            <h2 id="tools-title">Start with solar planning</h2>
            <p>This tools space will grow over time. Hello Solar Planner is the first release.</p>
          </div>

          <article class="tool-feature">
            <div class="tool-copy">
              <div class="tool-identity">
                <img src="${solarPlannerLogoUrl}" alt="" />
                <span>Energy planning</span>
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
                <a class="text-action" href="https://os.myhellohub.org/helloworld/solar_planner">View source</a>
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
        </section>

        <section class="open-band" id="open-source" aria-labelledby="open-title">
          <div class="open-intro">
            <p class="eyebrow">Our open-source philosophy</p>
            <h2 id="open-title">Useful tools should travel farther than one deployment.</h2>
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

        <section class="future-band" aria-labelledby="future-title">
          <p class="eyebrow">What comes next</p>
          <h2 id="future-title">A growing toolkit for community infrastructure.</h2>
          <p>Solar planning is the first tool. Future releases can sit here alongside it while remaining independently deployable and open.</p>
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
          <a href="https://myhellohub.org/">Project Hello World</a>
        </div>
      </footer>
    </div>
  `;
}
