'use strict';

const ICLASSPRO_DASHBOARD_URL = 'https://portal.iclasspro.com/elemental5/dashboard';

module.exports = {
  launchPhase: 'current',

  phases: {
    current: {
      openingDateDisplay: 'January 2027',
      enrollmentLaunchDateDisplay: '',
      enrollmentCtaLabel: 'Student Portal',
      enrollmentCtaUrl: ICLASSPRO_DASHBOARD_URL,
      showJanuaryEnrollmentSections: false
    },

    enrolling: {
      openingDateDisplay: 'January 2027',
      enrollmentLaunchDateDisplay: '',
      enrollmentCtaLabel: '',
      enrollmentCtaUrl: '',
      showJanuaryEnrollmentSections: true
    }
  }
};
