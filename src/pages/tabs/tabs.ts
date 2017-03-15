import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { Tasks } from '../tasks/tasks';
import { ActiveTask } from '../activetask/activetask';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = Tasks;
  tab3Root: any = ActiveTask;

  constructor() {

  }
}
