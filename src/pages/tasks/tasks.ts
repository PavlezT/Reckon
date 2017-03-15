import { Component } from '@angular/core';

import { NavController, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'tasks.html'
})
export class Tasks {

   tasks : any;
   selectedTask : any;

  constructor(public navCtrl: NavController,public alertCtrl: AlertController) {
      this.getTasks().then(data =>{this.tasks = data} );
  }

  public getTasks() : Promise<any> {
     return Promise.resolve([{name:"name1",id:12},{name:"name 2",id:11}]);
  }

   public taskClicked(task) : void {
       this.selectedTask = task;
       this.showPrompt();
   }

   public showPrompt() : void {
      let prompt = this.alertCtrl.create({
         title: 'Working on task',
         message: "Active working on this task?",
         buttons: [
           {
             text: 'Cancel',
             handler: data => {
               prompt.dismiss();
             }
           },
           {
             text: 'Save',
             handler: data => {
               prompt.dismiss();
               this.changeActiveTask();
             }
           }
         ]
       });
       prompt.present();
   }

   public changeActiveTask() : void {
      console.log('task changing')
   }

}
