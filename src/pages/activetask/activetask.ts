import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, ToastController } from 'ionic-angular';
import { Device } from 'ionic-native';
import { consts } from '../../config/consts';

@Component({
  selector: 'page-contact',
  templateUrl: 'activetask.html'
})
export class ActiveTask {

   task : any;

  constructor(public navCtrl: NavController, public toastCtrl: ToastController,@Inject(Http) public http : Http) {
     this.getActiveTask();
  }

  private getActiveTask() : void {
     let url = `${consts.url}/tasks/active?id_device=${(Device.uuid || 123)}`;

     this.http.get(url).timeout(consts.timeout).retry(consts.retry).toPromise()
      .then(resdata=>{
         let data = resdata.json();
         this.task = {
            id : data.id || '',
            title : data.title || '',
            created : data.created || '',
            author : data.author || '',
            description : data.description || ''
         }
      })
      .catch(error=>{console.log('<ActiveTask> getActiveTask error:',error)})
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

}
