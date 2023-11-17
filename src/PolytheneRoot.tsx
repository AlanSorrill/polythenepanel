import { createRoot } from 'react-dom/client';
import { AnyPanelIdFrom, AnyStateFrom, Generic_PolythenePanel, Generic_PolythenePanel_OfPackage, Generic_Polythene_Options, PPC_Default, PP_None, PP_None_State, PP_Split, PanelID, PanelUnionFrom, PolytheneContainer, PolythenePanel, PolythenePanel_Props, PolythenePanel_State, Polythene_Options, PopSpace, TuplesToMap } from './Imports'
import React, { ReactElement, StrictMode } from 'react'

export interface PolytheneRoot_Props {

}
export interface PolytheneRoot_State {
    rootState: PolythenePanel_State<PanelID<string, string>> | null
}
export class PolytheneRoot extends React.Component<PolytheneRoot_Props, PolytheneRoot_State>{
    constructor(props: PolytheneRoot_Props) {
        super(props);
        this.state = {
            rootState: null
        }
    }
    router: PolytheneRouter = null;
    componentDidMount(): void {
        this.router = PolytheneRouter.Get();
        this.router.setRoot(this);
        this.setState({ rootState: this.router.currentState });
    }
    componentWillUnmount(): void {
        this.router?.setRoot(null);
    }
    isPanel: false = false
    getRoot() {
        return this;
    }
    get isRoot() {
        return true;
    }
    render() {
        let ths = this;
        return this.state.rootState == null ? <div>Loading</div> : <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: fColor.darkMode[0].toHexString() }}>{
            <PolytheneContainer barSide='Top' buttonCorner='TopLeft' canExpand={false} originalState={this.state.rootState} parent={this} setState={(freshState: PolythenePanel_State<PanelID<string, string>>) => {
                console.log(`PolytheneRoot setstate`, freshState)
                ths.router.setState(freshState);
                ths.setState({ rootState: freshState });
            }} />
            // this.router.renderContainer(this, (freshState) => {
            // ths.router.setState(freshState);
            // ths.setState({ rootState: freshState });
            // }, this.state.rootState)
        }
        <PopSpace key={'popSpace'} />
        </div>
    }
}

//export type Polythene_Options_WithDefaults<Options extends Generic_Polythene_Options> = (Options | Polythene_Options<'Default', PPC_Default>);
export type PanelConstructorMap<Options extends Generic_Polythene_Options> = Map<`${string}.${string}`, (parent: Generic_PolythenePanel | PolytheneRoot, setState: (freshState: PolythenePanel_State<PanelID<string, string>>) => void, defaultState?: PolythenePanel_State<PanelID<string & unknown, string & unknown>>) => ReactElement<PanelUnionFrom<Options> | PPC_Default>>
export type PannelRegistrationOptions<PackageName extends string, PanelName extends string> = {
    open?: (param: any)=>(PolythenePanel_State<PanelID<PackageName,PanelName>> | null)
}
export function RegisterPanel<PackageName extends string, PanelName extends string>(packageName: PackageName, panelName: PanelName, options: PannelRegistrationOptions<PackageName, PanelName>) {
    console.log(`Register panel`);
    return function <PanelClass extends PolythenePanel<PanelID<PackageName, PanelName>, any>>(target: new (props: PolythenePanel_Props<[PackageName, PanelName]>) => PanelClass) {
        console.log(`Registering `, target as typeof PolythenePanel);
        let panelId: `${string}.${string}` = `${packageName}.${panelName}`;
        PolytheneRouter._constructorMap.set(panelId, target as any);
        PolytheneRouter._optionsMap.set(panelId,options);
    } as any;
}
type StaticConstants = {
    ConstructorMap: PanelConstructorMap<Generic_Polythene_Options>,
    OptionsMap: Map<string, PannelRegistrationOptions<string, string>>
}
export class PolytheneRouter {
    // options: Polythene_Options_WithDefaults<Options>[];
    currentState: PolythenePanel_State<PanelID<string, string>>
    currentRoot: PolytheneRoot | null = null;
    private constructor() {
        //  this.options = [this.getDefaultOptions()];
        // for (let option of options) {
        //     this.options.push(option); 
        // }
        this.currentState = this.getStateFromUrl();

        //  this.constructorMap = this.buildConstructorMap();

    }//
    private static panelIdCounter = 0;
    static GetUid(){
        return this.panelIdCounter++;
    }
    static Get() {
        if (typeof window['polytheneRouter'] == 'undefined') {
            window['polytheneRouter'] = new PolytheneRouter();
        }
        return window['polytheneRouter'];
    }

    setRoot(rootElement: PolytheneRoot) {
        if (this.currentRoot != null) {
            if (this.currentRoot == rootElement || rootElement == null) {
                this.currentRoot = rootElement;
                return;
            }
            throw new Error(`Only 1 PolytheneRoot per window`)
        }
        this.currentRoot = rootElement;
    }

    // constructorMap: PanelConstructorMap<Options>
    // static _constructorMap: PanelConstructorMap<Generic_Polythene_Options> = new Map()
    static get _constructorMap(): PanelConstructorMap<Generic_Polythene_Options> {
        return this._staticConstants.ConstructorMap;
    }
    private static get _staticConstants() {
        let gObj = typeof window != undefined ? window : global;

        if (typeof gObj['_polythene'] == 'undefined') {
            gObj['_polythene'] = {
                ConstructorMap: new Map(),
                OptionsMap: new Map()
            } as StaticConstants;
        }
        return gObj['_polythene'] as StaticConstants;
    }
    //
    static get _optionsMap() {
        return this._staticConstants.OptionsMap
    }

    setState(freshState: PolythenePanel_State<PanelID<string, string>>) {
        this.currentState = freshState;
        this.setUrlFromState();
    }
    getNoneState() {
        return {
            panelTypeName: ['Default', 'None']
        } as PP_None_State
    }
    getStateFromUrl() {
        let queryString = (window.location.search ? (window.location.search.startsWith('?') ? window.location.search.substring(1) : window.location.search) : '');
        let queryMap = TuplesToMap(queryString.split('&').map(keyval => keyval.split('=') as [string, string]));
        if (!queryMap.has('polythene')) {
            return this.getNoneState();
        }
        let encoded = new Buffer(queryMap.get('polythene'), 'hex')
        let json = JSON.parse(encoded.toString('utf8'))
        return json;
    }
    stateToUrl() {
        let jsonPayload = new Buffer(JSON.stringify(this.currentState), 'utf8');
        return `?polythene=${jsonPayload.toString('hex')}`
    }
    setUrlFromState() {
        window.history.pushState('', '', this.stateToUrl())
    }

    // buildConstructorMap(): PanelConstructorMap<Options> {
    //     let out: PanelConstructorMap<Options> = new Map() as any;
    //     for (let option of this.options) {
    //         for (let panelName of Object.keys(option.panels)) {
    //             out.set(`${option.packageName}.${panelName}` as any, option.panels[panelName])
    //         }
    //     }
    //     return out;
    // }

    // getDefaultOptions(): Polythene_Options<'Default', PPC_Default> {
    //     return {
    //         packageName: 'Default',
    //         panels: {
    //             None(parent, setState, defaultState?) { return <PP_None setState={setState} parent={parent} defaultState={defaultState} /> },
    //             Split(parent, setState, defaultState?) { return <PP_Split setState={setState} parent={parent} defaultState={defaultState} /> }
    //         },
    //         styles: {
    //             barBackground: {}
    //         }
    //     }
    // }
    // renderContainer(parent: Generic_PolythenePanel | PolytheneRoot, setState: (freshState: AnyStateFrom<Options>) => void, state: AnyStateFrom<Options>): ReactElement<PanelUnionFrom<Options> | PPC_Default> {
    //     if (!state.panelName) {
    //         return null;
    //     }
    //     let renderer = PolytheneRouter._constructorMap.get(`${state.panelName[0]}.${state.panelName[1]}`);
    //     if (!renderer) {
    //         return <div style={{ color: 'red' }}>No renderer for {state.panelName}</div>
    //     }
    //     let factory = React.createFactory<PolythenePanel<any, any>>(renderer);
    //     return <PolytheneContainer>{

    //       //  React.createElement(renderer,{parent: parent, setState: setState, state: state} as any) as any
    //        // factory({ parent: parent, setState: setState, state: state } as any) as any
    //     }</PolytheneContainer>
    // }
}


// export type PolytheneDynamicState<RootPanelPanelStates extends PolythenePanelState<string & unknown>> = {

//}


export function InitPolythene<PanelUnion extends Generic_PolythenePanel>(element: HTMLElement) {
    const root = createRoot(element);
    (window as any)['root'] = root;
    root.render(<StrictMode><PolytheneRoot /></StrictMode>)
}