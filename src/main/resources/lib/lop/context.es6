import { run } from '/lib/xp/context';


export function runAsSu(fn) {
    return run(
        {
            //principals: ['role:system.admin'],
            user: {
                login: 'su',
                userStore: 'system'
            }
        },
        env => fn()
    ); // return
} // runAsSu
