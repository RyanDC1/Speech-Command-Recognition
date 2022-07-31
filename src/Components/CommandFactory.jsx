import React, { useState, useRef } from 'react'
import useSpeechModule from './useSpeechModule'
import { Button, Input, Row, Col, InputNumber, message, Progress, Tag } from 'antd';
import { isEmpty, get, map } from 'lodash'
import CommandRender from './CommandRender';

function CommandFactory() {

    const { value, isListening, toggleCommandRecognition, trainModel, trainProgress, helpText, endTrainSession, commands } = useSpeechModule()

    const commandNameRef = useRef(null)
    const epochRef = useRef(null)
    const samplesRef = useRef(null)

    const [isTraining, setIsTraining] = useState(false)
    const [isModuleLearning, setIsModuleLoading] = useState(false)

    return (
        <div className='main-container'>
            <h2>Speech Command Recognition</h2>
            <p style={{fontWeight: 600}}>Recognized Command: {value}</p>
            <Button
                onClick={toggleCommandRecognition}>
                {isListening ? "Stop Recogintion" : "Start Recogintion"}
            </Button>
            <Button
                style={{ marginLeft: 8, minWidth: 137 }}
                disabled={isListening}
                onClick={() => setIsTraining(!isTraining)}>
                Training
            </Button>
            {
                isTraining && !isListening ?
                <>
                    <Row className='speech-training-config' gutter={[16, 16]}>
                        <Col span={12}>
                            <Input ref={commandNameRef} placeholder="Commands. Add mutiple commands separted by ','" />
                        </Col>
                        <Col span={2} style={{ marginRight: 120 }}>
                            <InputNumber ref={samplesRef} addonBefore="Samples" defaultValue={5} />
                        </Col>
                        <Col span={2}>
                            <InputNumber ref={epochRef} addonBefore="Epochs" defaultValue={25} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col>
                            <Button type='primary' onClick={trainModule}>Listen</Button>
                        </Col>
                        <Col hidden={!helpText}>
                            {`Repeat "${get(helpText, 'command', "")}" ${get(helpText, 'sample', "")} times`}
                        </Col>
                    </Row>
                    <Row hidden={!trainProgress} style={{ marginTop: 24, width: 320 }}>
                        <Progress
                            percent={trainProgress}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                            status={trainProgress !== 100 ? 'active' : 'success'}
                        />
                    </Row>
                </>
                :
                <p style={{textAlign:'initial', marginTop: 24}}>Available Commands: {map(commands, (command, index) => (<Tag key={index}>{command}</Tag>))}</p>
            }
            <div className='command-render'>
                <CommandRender command={String(value).trim().toLowerCase()}/>
            </div>
        </div>
    )

    function trainModule() {
        let commands = commandNameRef.current.input.value
        let epochs = epochRef.current.value
        let samples = samplesRef.current.value


        if (!isEmpty(commands) && !isEmpty(epochs) && !isEmpty(samples)) {
            commands = commands.split(',').map(c => c.trim())
            setIsModuleLoading(true)
            trainModel(commands, samples, epochs)
        }
        else {
            message.error("Please enter values in all fields")
        }
    }

}

export default CommandFactory