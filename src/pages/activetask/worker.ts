

export class Worker {

   public task(type: string, data : any,part_id:string) : Promise<any> {
     if(this[type]){
       return this[type](data,part_id);
     } else {
       console.log('<Worker> no type find');
       return Promise.reject('no task type find');
     }
  }

   public FBL(data,part_id): Promise<any>{
      let result = data.match(/[A-Z]/g) || [];
      return Promise.resolve({result:result,part_id:part_id});
   }
}
