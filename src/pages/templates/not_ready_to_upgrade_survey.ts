import { escapeHtml, getContext, getEnv, getLocale, htmlPage } from '../../lib/paywall';

export const prerender = false;

const options = [
  'Unfamiliar with subscription benefits and features',
  'Unclear about how the subscription supports my goals',
  'Price is too high',
  "Still uncertain if it's the right fit for me",
  'Free learning resources are available elsewhere',
  "Courses don't align with my interests and goals",
  "Unsure if I'll have time to utilize the subscription",
  "I'm a student and the price is too high",
  'Other',
];

export function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const locale = getLocale(request);
  const context = getContext(url);
  const env = getEnv();
  const shuffled = [...options.slice(0, 8)].sort(() => Math.random() - 0.5);
  shuffled.push('Other');

  const continueUrl = context === 'workspace' ? env.WORKSPACE_URL : env.APP_BASE_URL;

  const list = shuffled
    .map((item, index) => {
      return `<li>
        <label for="reason_${index}" class="radio-item">
          <input type="radio" name="reason" value="${escapeHtml(item)}" id="reason_${index}" class="radio-input js-feedback-radio" />
          <span class="radio-indicator"></span>
          <span class="radio-text">${escapeHtml(item)}</span>
        </label>
        <textarea id="free_form_${index}" rows="2" class="text-input js-input-message is-hidden" placeholder="Share more details"></textarea>
      </li>`;
    })
    .join('');

  return new Response(
    htmlPage(
      locale,
      `<article class="modal-card">
        <form>
          <div class="card-body">
            <div class="text-left">
              <h1 class="heading-lg">Tell us why you are not ready to switch plans</h1>
              <div class="list-panel">
                <ul class="option-list">${list}</ul>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary ml-auto" type="submit">Submit feedback</button>
          </div>
        </form>
      </article>
      <script>
        const radioButtons = document.querySelectorAll('.js-feedback-radio');
        let textareaId;

        radioButtons.forEach(function (radio) {
          radio.addEventListener('change', function () {
            const textareas = document.querySelectorAll('.text-input');
            textareas.forEach(function (textarea) {
              textarea.style.cssText = 'display: none !important';
            });

            textareaId = 'free_form_' + radio.id.split('_')[1];
            const textarea = document.querySelector('#' + textareaId);
            if (textarea) textarea.style.cssText = 'display: block !important';
          });
        });

        const form = document.querySelector('form');
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          const selectedReason = document.querySelector('.js-feedback-radio:checked');
          if (!selectedReason) {
            window.top.location.href = '${continueUrl}';
            return;
          }

          const freeFormTextarea = document.querySelector('#' + textareaId);
          const isStudentReason = selectedReason.value === "I'm a student and the price is too high";

          const eventProperties = {
            template_id: 'conversion-dialogs',
            event_group: 'survey',
            reason_selected: selectedReason.value,
            student_offer_redirect: isStudentReason,
          };

          if (freeFormTextarea && freeFormTextarea.value !== '') {
            eventProperties.reason_details = freeFormTextarea.value;
          }

          const dataLayerContent = {
            event: 'template_event',
            template_event_name: 'Template Dialog - Feedback Submitted',
            template_event_properties: eventProperties,
          };

          if (typeof window.dataLayer === 'undefined') {
            window.dataLayer = [dataLayerContent];
          } else {
            window.dataLayer.push(dataLayerContent);
          }

          if (isStudentReason) {
            window.dataLayer.push({
              event: 'template_event',
              template_event_name: 'Template Dialog - Redirected to Student Offer',
              template_event_properties: { template_id: 'conversion-dialogs', event_group: 'survey' },
            });
            window.top.location.href = '${env.APP_BASE_URL}/pricing/student';
            return;
          }

          window.top.location.href = '${continueUrl}';
        });
      </script>
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>`,
      'Not Ready To Upgrade Survey',
    ),
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    },
  );
}
