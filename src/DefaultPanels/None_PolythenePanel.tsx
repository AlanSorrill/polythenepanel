import React from 'react'
import { MaterialSymbol, PolythenePanel, PolythenePanel_State, RegisterPanel } from '../Imports'


export type PP_None_State = PolythenePanel_State<['Default', 'None']>

@RegisterPanel('Default', 'None',{})
export class PP_None extends PolythenePanel<['Default', 'None'], PP_None_State> {
  

    getDefaultState(): Omit<PP_None_State,'panelInstanceId'> {
        return {
            panelTypeName: ['Default', 'None']
        }
    }

    getIcon(): MaterialSymbol {
        return 'block';
    }
    getDisplayName(): string {
        return "None"
    }

    renderBody(): React.ReactNode {
        return <div style={{ backgroundColor: fColor.darkMode[0].toHexString(), color: 'white', display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1 }} />
                <div>None</div> 
                <div style={{ flexGrow: 1 }} />
            </div>
            <div style={{ flexGrow: 1 }} />
        </div>
    }
}


