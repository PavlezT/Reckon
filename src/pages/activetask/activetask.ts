import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'activetask.html'
})
export class ActiveTask {

   task : any;

  constructor(public navCtrl: NavController) {

  }

}
