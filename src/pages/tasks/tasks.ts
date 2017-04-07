import { Component,  Inject } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, AlertController, ToastController, Events } from 'ionic-angular';
import { Device } from 'ionic-native';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retry';
import { consts } from '../../config/consts';

@Component({
  selector: 'page-about',
  templateUrl: 'tasks.html'
})
export class Tasks {

   tasks : any;
   selectedTask : any;

  constructor(public navCtrl: NavController,public alertCtrl: AlertController,public events: Events, public toastCtrl: ToastController,@Inject(Http) public http : Http) {
      this.getTasks().then(data =>{this.tasks = data;} );
  }

  public getTasks() : Promise<any> {
     let url = `${consts.url}/tasks/all`;

     return this.http.get(url).timeout(consts.timeout).retry(consts.retry).toPromise()
      .then(data => {return data.json()})
      .catch(error => {
         console.error('<Tasks> getTasks error:',error);
         return [];
      })
  }

  public doRefresh(refresher:any) : void {
    this.getTasks().then(data =>{this.tasks = data;refresher.complete();});
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

   private showToast(message: any){
      let toast = this.toastCtrl.create({
        message: (typeof message == 'string' )? message : message.toString().substring(0,( message.toString().indexOf('&#x') || message.toString().length)) ,
        position: 'bottom',
        showCloseButton : true,
        duration: 9000
      });
      toast.present();
 }

   public changeActiveTask() : void {
      let url = `${consts.url}/tasks/active`;
      let data = {
         id_device : Device.uuid || 123,
         id_task : this.selectedTask.id
      }

      this.http.post(url,data).timeout(consts.timeout).retry(consts.retry).toPromise()
         .then(res => {
            if(res)this.events.publish('task:activated');
            else throw new Error('There is no task')
         })
         .catch(error=>{
            console.error('<Tasks> changeActiveTask error:',error)
            this.showToast('Can`t accept working this task on your devcie:'+ (error.json().error||''));
         })
   }

}
