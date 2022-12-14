import { customRef } from 'vue'

export default function useDelayRef(value) {
    return customRef((track, trigger) => {
        let timer;
        return {
            get() {
                // console.log(`从myRef这个容器读取数据,data:${value}`);
                track(); //通知追踪value的变化(跟getter商量一下让它明确你这个value是有用的)
                return value; //读取的时候就会调用get
            },
            set(nv) {
                // console.log(`myRef容器中的数据被修改,data改为${nv}`);
                clearTimeout(timer);
                timer = setTimeout(() => {
                    value = nv;
                    trigger(); //trigger通知vue重新解析模版 //防抖
                }, 500);
            }
        }
    })
}