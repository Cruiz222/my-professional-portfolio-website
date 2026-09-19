import { useState } from 'react';

function UpdateTitle() {
    const [title, setTitle] = useState('');
    
    const [input, setInput] = useState('');

    return (
        <div>
            <h1>Current Title: {title}</h1>

            <input type="text" value="input" onChange={(e) => setInput(e.target.value)} >
            Input title</input>

            <button onClick={() => setTitle(input)}>Set title</button>
        </div>

    )
}

 export default UpdateTitle