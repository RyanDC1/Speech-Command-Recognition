import React, { useState, useEffect } from 'react'
import * as speech from "@tensorflow-models/speech-commands";
import * as tfjs from '@tensorflow/tfjs';
import { message, notification, Spin } from 'antd';
import { isEmpty } from 'lodash';

function useSpeechModule() {

    const [model, setModel] = useState(null)
    const [commands, setCommands] = useState(null)
    const [value, setValue] = useState(null)
    const [isModelLoading, setModelLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [trainProgress, setTrainProgress] = useState(null)
    const [helpText, setHelpText] = useState(null)


    useEffect(() => {
        loadSpeechModel()
    }, [])

    useEffect(() => {
        if (model != null && !model.isListening()) {
            toggleCommandRecognition()
        }
    }, [model])


    function loadSpeechModel() {
        setModelLoading(true)

        let recognizerInstance = speech.create("BROWSER_FFT")

        recognizerInstance.ensureModelLoaded()
            .then(() => {

                console.log(recognizerInstance)
                notification.success({
                    message: "Success!",
                    description: "Speech model loaded successfully"
                })
                setModel(recognizerInstance)
                setCommands(recognizerInstance.wordLabels())

            })
            .catch((error) => {
                console.log("An error occured while loading the speech model", error)
                notification.error({
                    message: "Error",
                    description: "An error occured, please reload this page"
                })
            })
            .finally(() => {
                setModelLoading(false)
            })
    }

    function argMax(arr) {
        return arr.map((value, index) => [value, index]).reduce((a, b) => (a[0] > b[0] ? a : b))[1]
    }

    function toggleCommandRecognition() {
        if (model != null) {
            notification.destroy()

            if (model.isListening()) {
                model.stopListening()
                setIsListening(false)
                notification.info({
                    key: "STOP",
                    message: "Speech Command Recogintion",
                    description: "Service has been stoped"
                })
            }
            else {
                setIsListening(true)
                model.listen(result => {
                    console.log("Result: ", result)
                    let possibleIndex = argMax(Object.values(result.scores))
                    console.log(model.wordLabels(), commands[possibleIndex])
                    setValue(commands[possibleIndex])
                }, {
                    includeSpectrogram: true,
                    probabilityThreshold: 0.75
                });

                notification.info({
                    key: "START",
                    message: "Speech Command Recogintion",
                    description: "Service has been started"
                })
            }
        }
    }

    async function collectSample(transferRecognizer, sampleSize, commands) {

        for(let index = 0; index < commands.length; index++)
        {
            let command = commands[index]
            if(!isEmpty(command))
            {
                for (let sample = sampleSize; sample > 0; sample--) {
                    setHelpText({ command, sample })
                    await transferRecognizer.collectExample(command)
                }
            }
        }
    }

    function endTrainSession() {
        setTrainProgress(null)
    }

    async function trainModel(commandsList, samples, epochs) {
        if (model == null) {
            return
        }
        
        setTrainProgress(0)
        const time = Date.now()
        let name = `custom-${time}`
        let recognizerInstance = speech.create("BROWSER_FFT")

        await recognizerInstance.ensureModelLoaded()

        const transferRecognizer = recognizerInstance.createTransfer(name)

        await collectSample(transferRecognizer, samples, commandsList)

        setTrainProgress(20)
        setHelpText(null)

        message.info({content: 'Please wait, recording background noise', duration: 5})

        for (let sample = 0; sample < 5; sample++) {
            await transferRecognizer.collectExample('_background_noise_')
        }

        setTrainProgress(25)
        console.log("Examples Recorded",transferRecognizer.countExamples());

        message.info({content: <span><Spin size='small' spinning/> Training...</span>, duration: null})

        let epochPercentIncrease = 75 / epochs;

        await transferRecognizer.train({
            epochs: epochs,
            callback: {
                onEpochEnd: async (epoch, logs) => {
                    console.log(`Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`);
                    if(epoch === epochs - 1)
                    {
                        setTrainProgress(100)
                    } else {
                        setTrainProgress((percent) => (percent + epochPercentIncrease))
                    }
                }
            }
        });

        message.destroy()

        notification.success({
            message: "Success!",
            description: "Speech model trained successfully"
        })

        setTrainProgress(null)
        
        const words = transferRecognizer.wordLabels();
        setCommands(words)
        setModel(transferRecognizer)
    }

    return { value, isListening, toggleCommandRecognition, trainModel, trainProgress, helpText, endTrainSession, commands }
}

export default useSpeechModule