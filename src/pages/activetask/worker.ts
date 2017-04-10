

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
      let result = data.match(/[A-ZА-Я]/g) || [];
      return Promise.resolve({result:result,part_id:part_id});
   }

   public FSL(data,part_id): Promise<any>{
      let result = data.match(/[a-zа-я]/g) || [];
      return Promise.resolve({result:result,part_id:part_id});
   }

   public CF(data,part_id): Promise<any>{
     return Promise.resolve({result:data[0]*data[1],part_id:part_id});
   }

   public E(data,part_id): Promise<any>{
     let res = data[1] > 1 ? data[0] * data[0] : data[0];
     return Promise.resolve({result:res,part_id:part_id});
   }
}
