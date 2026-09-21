import { useState } from 'react';

function UpdateTitle() {
    const [title, setTitle] = useState('');
    
    const [input, setInput] = useState('');

    const [description, setDescription] = useState('');

    return (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>

          <label>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
            Input title
            </label> 

            <label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                Input description
            </label>


            <button onClick={() => {setTitle(input); setDescription(description)}}>Enter</button>

        </div>

    )
}

 export default UpdateTitle