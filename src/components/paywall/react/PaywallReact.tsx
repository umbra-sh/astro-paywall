import React from 'react';
import { PaywallCard, CloseButton, CtaButton, FeatureList } from './index';
import styles from './PaywallReact.module.css';

interface PaywallReactProps {
  dismissable: boolean;
  showSurvey: boolean;
  context: string;
  resolved: {
    back: boolean;
    backUrl: string;
    ctaUrl: string;
  };
  features: string[];
}

export const PaywallReact: React.FC<PaywallReactProps> = ({
  dismissable,
  showSurvey,
  context,
  resolved,
  features,
}) => {
  return (
    <PaywallCard
      footer={
        <div className={styles.footerButtons}>
          {resolved.back && (
            <CtaButton
              variant="ghost"
              href={resolved.backUrl}
              data-trackid="paywall-go-back"
            >
              Go back
            </CtaButton>
          )}
          <CtaButton
            variant="primary"
            href={resolved.ctaUrl}
            data-trackid="paywall-see-plans"
          >
            See Pro plans
          </CtaButton>
        </div>
      }
    >
      <div className={styles.content}>
        {dismissable && <CloseButton />}

        <span className={styles.eyebrow}>Pro Plan (React)</span>
        <h1 className={styles.heading}>Move forward with a better plan</h1>

        <p className={styles.description}>
          Choose a subscription that matches your pace and unlock guided projects,
          assessments, and progress insights.
        </p>

        <div
          className={styles.featureHero}
          role="img"
          aria-label="Product dashboard preview"
        ></div>

        <FeatureList items={features} />

        {showSurvey && (
          <div className={styles.feedbackSection}>
            <p className={styles.feedbackText}>
              Need more time before you choose?
              <a
                href={`/paywall-react/survey?context=${context}`}
                className={styles.feedbackLink}
              >
                Tell us why
              </a>
            </p>
          </div>
        )}
      </div>
    </PaywallCard>
  );
};

export default PaywallReact;
