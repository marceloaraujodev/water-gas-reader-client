
import { useState } from 'react';
import { Button, Uploader } from 'rsuite';
import axios from 'axios';
// import imageToBase64 from 'image-to-base64';
import 'rsuite/dist/rsuite.min.css';
import c from './From.module.css';

// {
//   "image_url": "https://generativelanguage.googleapis.com/v1beta/files/qq1ml47pms0a",
//   "measure_value": 221,
//   "measure_uuid": "1cce053a-f951-4bb6-befb-1988446fd758",
//   "message": "Operação realizada com sucesso"
// }

type FileType = {
  name?: string;
  fileKey?: number | string;
  status?: 'inited' | 'uploading' | 'error' | 'finished';
  progress?: number;
  url?: string;
  blobFile?: File; 
  base64String?: string;
}

type ResponseRead = {
  image_url: string;
  measure_value: number;
  measure_uuid: string;
  message: string;
}

// dated formated to the backend 
function dateString(): string {
  const date = new Date();
  const dateToString = date.toISOString();
  return dateToString
}



export default function Form(): JSX.Element {
  const [fileList, setFileList] = useState<FileType[]>([]);
  const [customerCode, setCustomerCode] = useState<string>('');
  const [measureType, setMeasureType] = useState<string>('GAS');
  const [readingTime, setReadingTime] = useState<string>('');
  const [readDetails, setReadDetails] = useState<ResponseRead>({
    image_url: '',
    measure_value: 0,
    measure_uuid: '',
    message: ''
  })

  function time(): void{
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    setReadingTime(`${hours}:${minutes}`)
    console.log(`${hours}:${minutes}`, typeof hours, typeof minutes)
  }
 
  
  function handleChange(files: FileType[]): void{
    const updatedFileList: FileType[] = [];

    files.forEach(file => {
      if (file.blobFile) {
        const reader = new FileReader();

        reader.onloadend = () => {
          updatedFileList.push({
            ...file,
            base64String: (reader.result as string).split(',')[1], // Convert to Base64
          });

          if (updatedFileList.length === files.length) {
            setFileList(updatedFileList); // Set state only after all files are processed
          }
        };

        reader.readAsDataURL(file.blobFile); // Convert file to Base64
      }
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void>{
    e.preventDefault();

    console.log(fileList[0])
    const payload: {
      image: string;
      customer_code: string;
      measure_datetime: string;
      measure_type: string;
    } = {
      image: fileList[0].base64String as string,
      customer_code: customerCode,
      measure_datetime: dateString(),
      measure_type: measureType
    }
    // submit form data
    // const res = await axios.post('http://localhost:3000/api/v1/upload', payload)
    const res = await axios.post('https://water-gas-reader.onrender.com/api/v1/upload', payload)

    if(res.status === 200){
      console.log('success')
      console.log(res)
      setReadDetails(res.data) // update readDetails state with response data
      time();
    } else {
      console.log('error')
    }

    // clear file list
    setFileList([])
  }

  return (
    <div>
      <form className={c.form} onSubmit={handleSubmit}>
        <div className={c.title}>Consumption Meter Reading
        <div className={c.readingTime}>Last reading: {readingTime}</div>
        </div>
        <div className={c.contentAll}>
          <div className={c.inputAndUploaderCont}>
            <div className={c.inputs}>
              <label>Customer Code:</label>
              <input 
                className={c.input} 
                type='text' 
                name='customerCode' 
                required 
                onChange={(e) => setCustomerCode(e.target.value)}
                value={customerCode}
              />
              <label htmlFor="utility">Choose Utility:</label>
              <select 
                id="utility" 
                name="utility" 
                className={c.select}
                onChange={(e) => setMeasureType(e.target.value)}
              >
                  <option value="GAS">GAS</option>
                  <option value="WATER">WATER</option>
              </select>
            </div>
            <Uploader 
              action="uload url"
              multiple
              onChange={handleChange}
              autoUpload={false}
              className={c.btnCont}
              >
                <div className={c.btnCont}>
                  <Button>Select files... </Button>
                </div>
            </Uploader>
          </div>
          <div className={c.uploadBtn}><Button type='submit'>Upload files</Button></div>
        </div>
        <div className={c.readDetails}>
        <h4>Read Details:</h4>
        <p>Measured Value: <span className={c.measureValue}>{readDetails.measure_value}</span></p>
        {/* <p>Measure UUID: {readDetails.measure_uuid}</p> */}
      </div>
      </form>
    </div>
  )
}