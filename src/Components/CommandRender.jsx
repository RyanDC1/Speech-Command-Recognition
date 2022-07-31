import React, { useState, useEffect } from 'react'
import { Typography, Input, Button, Modal } from 'antd'

function CommandRender({ command }) {

    const { Text } = Typography

    useEffect(() => {
        let box = document.getElementById('box')
        if(box)
        {
            box.style.backgroundColor = command
            if(command === 'left' || command === 'right')
            {
                box.style.float = command
            }
        }
        commandForm()
    }, [command])

    return (
        <div>
            <h3 style={{textAlign: 'center'}}>Test Area</h3>
            <Text type='secondary'>Say Left/right commands to shift the box</Text>
            <br/>
            <Text type='secondary'>Say a color command to change the color of the box</Text>
            <div>
                <div id='box' style={{ padding: 20, width: 80, height: 80, border: "1px solid"}}/>
            </div>
            <br/>
            <br/>
            <p>Name</p>
            <Input id="name" placeholder='say "Name" to focus'/>
            <br/>
            <p>LastName</p>
            <Input id="lastname" placeholder='say "LastName" to focus'/>
            <Text type='secondary'>Say submit to trigger submit button</Text>
            <br/>
            <Button id="submit" type='primary' onClick={submitForm}>Submit</Button>

        </div>
    )

    function commandForm() {
        let field = document.getElementById(command);

        if(field)
        {
            field.focus()
            field.click()
        }
    }

    function submitForm() {
        Modal.success({
            title: 'Form Submitted',
            content: 'Form submitted successfully'
        })
    }
}

export default CommandRender