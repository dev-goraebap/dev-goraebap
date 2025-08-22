// ---------------------------------------------
// Vite Entry Point
// ---------------------------------------------

import * as Turbo from '@hotwired/turbo';
import TurboPower from 'turbo_power';
import './controllers';

window.Turbo = Turbo;
TurboPower.initialize(Turbo.StreamActions);
