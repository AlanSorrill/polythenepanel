import { } from './Imports'


const EventListenerMode = { capture: true };

export type MouseGulag_Options<Element extends HTMLElement>  = {
    onDrag: (evt: React.MouseEvent<Element, MouseEvent>) => void
    onDragStart?: (evt: React.MouseEvent<Element, MouseEvent>) => void
    onDragEnd?: (evt: React.MouseEvent<Element, MouseEvent>) => void
}
export class MouseGulag<Element extends HTMLElement> {
    private _moveListener: (evt: any) => void;
    private _upListener: (evt: any) => void;
    options: MouseGulag_Options<Element>;
    
    constructor(options: MouseGulag_Options<Element>) {
        this.options = options;
        let ths = this;
        this._upListener = (evt) => ths.mouseupListener(evt)
        this._moveListener = (evt) => ths.mousemoveListener(evt)
    }

    private preventGlobalMouseEvents() {
        document.body.style['pointer-events'] = 'none';
    }

    private restoreGlobalMouseEvents() {
        document.body.style['pointer-events'] = 'auto';
    }
    private mousemoveListener(evt) {
        evt.stopPropagation();
        // do whatever is needed while the user is moving the cursor around
        //if(this.isMoving){
        this.options.onDrag(evt);
        // }
    }

    private mouseupListener(e) {
        this.restoreGlobalMouseEvents();
        this.options.onDragEnd?.(e);
        if(this._dragDetector){this._dragDetector.mouseIsDown = false}
        document.removeEventListener('mouseup', this._upListener, EventListenerMode);
        document.removeEventListener('mousemove', this._moveListener, EventListenerMode);
        e.stopPropagation();
        this.setDragEnabled(true);
    }
 
    capture(e: React.MouseEvent<Element, MouseEvent>) {
        this.setDragEnabled(false);
        this.preventGlobalMouseEvents();
        let ths = this;
        this.options.onDragStart?.(e);
        document.addEventListener('mouseup', this._upListener, EventListenerMode);
        document.addEventListener('mousemove', this._moveListener, EventListenerMode);
        e.preventDefault();
        e.stopPropagation();
    }
    get isMouseDown(){
        return this._dragDetector == null ? false : this._dragDetector.mouseIsDown
    }
    setDragEnabled(enabled: boolean){
        if(this._dragDetector == null){
            return;
        }
        this._dragDetector.enabled = enabled
    }
    _dragDetector: MouseDragDetector<Element> | null = null;


    ifDrag(thresh: number = 4){
        if(this._dragDetector == null){
            let ths = this;
            this._dragDetector = new MouseDragDetector((evt)=>{
                ths.capture(evt);
            },thresh);
        }
        if(this._dragDetector.thresh != thresh){
            this._dragDetector.thresh = thresh;
        }
        return this._dragDetector;
    }
}

export class MouseDragDetector<Element extends HTMLElement> {
    private lastPosition: [number, number];
    private downPosition: [number, number];
    thresh: number;
    enabled: boolean = true
    mouseIsDown: boolean = false;
    private onDragDetected: (evt: React.MouseEvent<Element, MouseEvent>) => void;
    constructor(onDragDetected: (evt: React.MouseEvent<Element, MouseEvent>) => void, threshold: number = 4) {
        this.thresh = threshold;
        this.onDragDetected = onDragDetected;
    }
    onMouseDown(evt: React.MouseEvent<Element, MouseEvent>) {
        if(!this.enabled){return}
        this.mouseIsDown = true;
        this.lastPosition = [evt.clientX, evt.clientY];
        this.downPosition = this.lastPosition;
    }

    onMouseMove(evt: React.MouseEvent<Element, MouseEvent>) {
        if(!this.enabled || !this.mouseIsDown){return}
        let current: [number, number] = [evt.clientX, evt.clientY];
        let delta: [number, number] = [current[0] - this.downPosition[0], current[1] - this.downPosition[1]];
        let distance = Math.sqrt(Math.pow(delta[0], 2) + Math.pow(delta[1], 2));
        if(distance > this.thresh){
            this.onDragDetected(evt);
            return;
        }
        this.lastPosition = current;
    }
}