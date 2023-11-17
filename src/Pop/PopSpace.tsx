/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-empty-interface */

import React from 'react'
import { } from '../Imports'

export type PopAutoClose = 'none' | 'mouseOut' | 'clickAway'
export type PopChildDescription_Partial = {
    positionX: number,
    positionY: number,
    autoClose: PopAutoClose
}
export type PopChildDescription = PopChildDescription_Partial & {

    render: (closePop: () => void, reRender: () => void) => React.ReactNode
}
export interface PopSpace_Props { }
export interface PopSpace_State { }
export class PopSpace extends React.Component<PopSpace_Props, PopSpace_State>{
    static get children(): Array<[number, PopChildDescription]> {
        if (typeof window['popSpaceChildrenList'] == 'undefined') {
            window['popSpaceChildrenList'] = [];
        }
        return window['popSpaceChildrenList'];
    }
    static set children(fresh: Array<[number, PopChildDescription]>) {
        window['popSpaceChildrenList'] = fresh;
    }

    private static childCounter = 0
    static addPop(child: PopChildDescription): (() => void) {
        const id = this.childCounter++;
        this.children.push([id, child])
        for (const callback of PopSpace.changeListeners.values()) {
            callback();
        }
        return () => {
            PopSpace.closePop(id)
        }
    }
    static closePop(id: number) {

        PopSpace.children = PopSpace.children.filter(([idd, child]) => (id != idd))
        for (const callback of PopSpace.changeListeners.values()) {
            callback();
        }
    }
    constructor(props: PopSpace_Props) {
        super(props);
    }
    watchCanceller: () => void
    componentDidMount(): void {
        const ths = this;
        this.watchCanceller = PopSpace.onChildrenChange(() => {
            console.log(`Updating popspace watchers`)
            ths.setState({});
        })
    }
    componentWillUnmount(): void {
        this.watchCanceller?.()
    }
    containerRef: React.RefObject<HTMLDivElement> = React.createRef()
    // private mouseEvtKeys: Array<keyof MouseEvent> = ['x', 'y', 'pageX', 'pageY', 'clientX', 'clientY', 'altKey', 'button', 'buttons', 'movementX', 'movementY', 'offsetX', 'offsetY', 'screenX', 'screenY', 'ctrlKey', 'timeStamp']
    // private passEvent(evt: MouseEvent) {
    //     let elems = document.elementsFromPoint(evt.clientX, evt.clientY)
    //     let evtCloneData = {} as any
    //     for (let key of this.mouseEvtKeys) {
    //         if (evt[key]) {
    //             evtCloneData[key] = evt[key]
    //         }
    //     }
    //     let evtClone = new Event(evt.type, evtCloneData)
    //     if (elems[0].isSameNode(this.containerRef.current)) {
    //         console.log(`Padding event ${evt.type} to`, elems[1])
    //         elems[1].dispatchEvent(evtClone)
    //     }
    // }
    render() {
        console.log("Rendering pop space")
        return <div id={'PopSpace'} ref={this.containerRef} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }} >

            {PopSpace.children.map(([id, child]) => (
                <PopSpaceChild id={id} description={child} key={id} />))}
        </div>
    }

    static get changeListeners(): Map<number, () => void> {
        if (typeof (window as any)['popSpaceChangeListeners'] == 'undefined') {
            (window as any)['popSpaceChangeListeners'] = new Map();
        }
        return (window as any)['popSpaceChangeListeners'];
    }
    private static changeListenerCount = 0;
    static onChildrenChange(callback: () => void): () => void {
        const id = this.changeListenerCount++
        PopSpace.changeListeners.set(id, callback);
        return () => {
            console.log(`Deleting watcher ${id}`)
            for (const callback of PopSpace.changeListeners.values()) {
                console.log(`Updating del popspace watchers`)
                callback();
            }
            PopSpace.changeListeners.delete(id)

        }
    }
}

export interface PopSpaceChild_Props {
    description: PopChildDescription
    id: number
}
export interface PopSpaceChild_State {
    mouseInside: boolean
    offset: [x: number, y: number]
}
export class PopSpaceChild extends React.Component<PopSpaceChild_Props, PopSpaceChild_State>{
    constructor(props: PopSpaceChild_Props) {
        super(props);
        this.state = { mouseInside: false, offset: [0, 0] }
    }
    componentDidMount(): void {
        const bounds = this.childContainer.current?.getBoundingClientRect()
        if (!bounds) {
            return;
        }
        const offset: [x: number, y: number] = [0, 0]
        if (bounds.right > window.innerWidth) {
            offset[0] = window.innerWidth - bounds.right
        }
        if (bounds.bottom > window.innerHeight) {
            offset[1] = window.innerHeight - bounds.bottom
        }
        this.setState({ offset: offset })
    }
    childContainer: React.RefObject<HTMLDivElement> = React.createRef();
    render() {
        const ths = this;
        return <div style={{ pointerEvents: 'all' }}>
            <div style={{
                position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
                backdropFilter: this.props.description.autoClose == 'none' ? undefined : 'blur(1px)',
                pointerEvents: this.props.description.autoClose == 'none' ? 'none' : 'all'
            }}
                onClick={() => {
                    if (ths.props.description.autoClose == 'clickAway') {
                        PopSpace.closePop(ths.props.id)
                    }
                }} onMouseEnter={() => {
                    if (ths.props.description.autoClose == 'mouseOut' && ths.state.mouseInside) {
                        PopSpace.closePop(ths.props.id)
                    }
                }}>

            </div>
            <div ref={this.childContainer} style={{ position: 'absolute', left: this.props.description.positionX + this.state.offset[0], top: this.props.description.positionY + this.state.offset[1], }}
                onMouseEnter={() => {
                    ths.setState({ mouseInside: true })
                }} >
                {this.props.description.render(() => {
                    PopSpace.closePop(this.props.id)
                }, () => { ths.setState({}) })}
            </div>
        </div>
    }
}

if (typeof window != 'undefined') {
    (window as any)['PopSpace'] = PopSpace
}

