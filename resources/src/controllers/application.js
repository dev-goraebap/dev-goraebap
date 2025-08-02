import { Application, Controller } from '@hotwired/stimulus';

const application = Application.start();

// Configure Stimulus development experience
application.debug = true;
window.Stimulus = application;
window.StimulusController = Controller;

export { application };
