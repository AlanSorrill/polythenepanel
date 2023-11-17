import { CornerName, Generic_PolythenePanel, PanelID, PolythenePanel, PolythenePanel_State, PolytheneRoot, PolytheneRouter, Side } from './Imports'
import React from 'react'

export interface PolytheneContainer_Props {
    //children: PolythenePanel<PanelID<string & unknown, string & unknown>, PolythenePanel_State<PanelID<string & unknown, string & unknown>>> & React.ReactNode
    originalState: PolythenePanel_State<PanelID<unknown & string, unknown & string>>,
    parent: PolytheneContainer | PolytheneRoot
    barSide: Side
    canExpand: boolean
    onExpand?: (state: PolythenePanel_State<PanelID<unknown & string, unknown & string>>)=>void
    buttonCorner: CornerName
    setState: (freshState: PolythenePanel_State<PanelID<unknown & string, unknown & string>>)=>void
}
export interface PolytheneContainer_State {
   // panelConstructor: new () => PolythenePanel<any, any>
}
module PolytheneContainer {
    export type PanelName = PanelID<unknown & string, unknown & string>
    export type PanelState = PolythenePanel_State<PanelName>
}
export class PolytheneContainer extends React.Component<PolytheneContainer_Props, PolytheneContainer_State>{

    constructor(props: PolytheneContainer_Props) {
        super(props);
       // this.state = { panelConstructor: PolytheneRouter._constructorMap.get(`${this.props.originalState.panelName[0]}.${this.props.originalState.panelName[1]}`) as any }
    }
    getRoot() {
        return this.props.parent.getRoot();
    }
    notifyPanelStateChanged(state: PolytheneContainer.PanelState) {
        this.props.setState(state);
    }
    get isRoot(){
        return false;
    }
    changePanel(freshPanel: PanelID<string,string>){
        
        this.props.setState({
            panelTypeName: freshPanel,
            loadDefaults: true,
            panelInstanceId: PolytheneRouter.GetUid()
        })
    }
    panelRef: React.RefObject<PolythenePanel<PolytheneContainer.PanelName, PolytheneContainer.PanelState>> = React.createRef();
    render() {



        return <div style={{ width: '100%', height: '100%', }}>

            {React.createElement(PolytheneRouter._constructorMap.get(`${this.props.originalState.panelTypeName[0]}.${this.props.originalState.panelTypeName[1]}`) as any, {
                key: this.props.originalState.panelTypeName.join('.'),
                defaultState: this.props.originalState,
                container: this,
                buttonCorner: this.props.buttonCorner,
                canExpand: this.props.canExpand,
                onExpand: this.props.onExpand,
                barSide: this.props.barSide,
                ref: this.panelRef
            } as any) as any}
        </div>
    }
}


