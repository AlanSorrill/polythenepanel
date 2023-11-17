/* eslint-disable @typescript-eslint/no-this-alias */
import React from 'react'
import { PopSpace } from '../Imports'
export interface PopNotification_Props {
    options: PopNotificationOptions,
    closePop: () => void
}
export interface PopNotification_State {
    slideIn: boolean

}
export class PopNotification extends React.Component<PopNotification_Props, PopNotification_State>{
    static slideDurration = 500
    static openNotifies: Map<number, PopNotificationOptions> = new Map()
    static openNotifiesCount = 0
    static reRenderPop: (() => void) | null

    constructor(props: PopNotification_Props) {
        super(props);
        this.state = { slideIn: true }
        if(typeof this.props.options.lifespan != 'undefined'){
            const ths = this;
            setTimeout(()=>{
                ths.setState({ slideIn: false }, () => {
                    setTimeout(() => {
                        ths.props.closePop()
                    }, PopNotification.slideDurration)
    
                });
            },this.props.options.lifespan)
        }
    }
    render() {
        return <div style={{
            padding: 16,
            paddingBottom: typeof this.props.options.lifespan != 'undefined' ? 26 : 16,
            minWidth: 300,
            marginBottom: 8,
            backgroundColor: fColor.darkMode[11].toHexString(),
            borderRadius: 4,
            boxShadow: `2px 2px 6px #000000cc`,
            color: fColor.white.toHexString(),
            cursor: 'pointer',
            animation: `${this.state.slideIn ? 'slideIn' : 'slideOut'} ${PopNotification.slideDurration / 1000.0}s forwards`,
            position: 'relative',
            overflow: 'hidden'
        }} onClick={() => {
            const ths = this;
            this.setState({ slideIn: false }, () => {
                setTimeout(() => {
                    ths.props.closePop()
                }, PopNotification.slideDurration)

            });
        }}>
            <div style={{ fontSize: 24 }}>{this.props.options.title}</div>
            {typeof this.props.options.lifespan != 'undefined' ?
                <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, height: 10, backgroundColor: fColor.darkMode[3].toHexString() }}>
                    <div style={{ position: 'absolute', left: 0, bottom: 0, height: 10, backgroundColor: fColor.green.base.toHexString(), animation: `widthZeroToFull ${this.props.options.lifespan / 1000.0}s forwards` }} />
                </div> :
                <div></div>}
        </div>
    }
}


export type PopNotificationOptions = {
    title: string,
    children?: () => React.ReactNode,
    lifespan?: number
}
export function popNotify(freshOptions: PopNotificationOptions) {
    const id = PopNotification.openNotifiesCount++;
    let closePopupCallback: (() => void) | null = null;
    const closeNotify = (iid: number) => {
        PopNotification.openNotifies.delete(iid);
        if (PopNotification.openNotifies.size == 0) {
            closePopupCallback?.();
        } else {
            PopNotification.reRenderPop?.()
        }
    }
    PopNotification.openNotifies.set(id, freshOptions)
    if (PopNotification.openNotifies.size == 1 || !PopNotification.reRenderPop) {
        PopSpace.addPop({
            autoClose: 'none', positionX: window.innerWidth, positionY: 16, render(closePop, reRender) {
                closePopupCallback = closePop;
                PopNotification.reRenderPop = reRender;
                return <div style={{}}>
                    {[...PopNotification.openNotifies.entries()].map(([index,options]) => (<PopNotification key={index} closePop={() => closeNotify(index)} options={options} />))}
                </div>
            },
        })
    } else {
        PopNotification.reRenderPop?.();
    }
}
(window as any)['popNotify'] = popNotify