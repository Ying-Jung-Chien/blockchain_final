import React, { useState, useEffect } from 'react';
import ScoreArtifact from './abi/contracts/Score.sol/Score.json';
import scoreContractAddress from './abi/contracts/Score.sol/contract-address.json';
import TranscriptArtifact from './abi/contracts/Transcript.sol/Transcript.json';
import transcriptContractAddress from './abi/contracts/Transcript.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";

function Review() {
  const [applicationState, setApplicationState] = useState({});
  const [originData, setOriginData] = useState({});
//   const [signature, setSignature] = useState({});
  const [verifyResult, setVerifyResult] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const transcriptContract = new web3.eth.Contract(TranscriptArtifact, transcriptContractAddress.Transcript);
        const penddingApplications = await transcriptContract.methods.getPenddingApplications().call();
        // console.log(penddingApplications);

        var origin = [];
        var verify = [];
        for (var i = 0; i < penddingApplications.length; i++) {
          const response = await fetch(`https://ipfs.io/ipfs/${penddingApplications[i]['ipfsCID']}`);
          const result = await response.json();
        //   console.log('result', result);
          
          var subOrigin = [];
          var subVerify = [];
          for (var j = 0; j < result.length; j++) {
            // console.log('result[', j, ']', result[j]);

            var message = result[j]['origin'];
            subOrigin.push(message);
            
            const signedResponse = await fetch(`https://ipfs.io/ipfs/${result[j]['signCid']}`);
            const signature = await signedResponse.text();
            // console.log('signature', signature);

            // console.log('message', message);
            const verifySignatureReturn = await verifySignature(message, signature, result[j]['signer']);
            // console.log('verifySignatureReturn', verifySignatureReturn);
            subVerify.push(verifySignatureReturn);
          }
          origin.push(subOrigin);
          verify.push(subVerify);
        }
        
        setOriginData(origin);
        setVerifyResult(verify);
        console.log('originData', originData);
        console.log('verifyResult', verifyResult);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchData();
  });

  const verifySignature = async (message, signature, signerAddress) => {
    try {
      const web3 = new Web3(window.ethereum);
      const recoveredAddress = await web3.eth.personal.ecRecover(
        JSON.stringify(message),
        signature
      );
      const result =  recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
    //   console.log('verifySignature', result);
      return result;
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleApprove = (e) => {
    e.preventDefault();
    console.log('handleApprove');
    // addApplyData();
  };

  const handleReject = (e) => {
    e.preventDefault();
    console.log('handleReject');
    // addApplyData();
  };


  return (
    <div>
    {Object.entries(originData).map(([index, data]) => (
      <div key={index}>
        <table>
          <thead>
            <tr>
             <th>原始資料</th>
             <th>驗證結果</th>
          </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([id, { subject, studentId, score }]) => (
              <tr key={id}>
                <td>{id}, {subject}, {studentId}, {score}</td>
               <td>{verifyResult[index][id] ? 'Pass' : 'Failed'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleApprove}>
          <button type="submit">Approve</button>
        </form>
        <form onSubmit={handleReject}>
          <button type="submit">Reject</button>
        </form>
      </div>
      ))}
    </div>
  );
}

export default Review;