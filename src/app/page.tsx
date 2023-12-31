'use client'

import { sendGraphQLQuery } from '@/graphql/Survey/createMySurvey';
import { deleteGraphQLQuery } from '@/graphql/Survey/deleteSurvey';
import { getGraphQLQuery } from '@/graphql/Survey/getMySurvey';
import { faClipboard, faPeopleGroup, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from './context/isLogined';

interface Survey {
  s_id: string;
  title: string;
}

export default function Home() {
  const { accessToken, email, photo } = useAuth();
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [mySurveys, setMySurveys] = useState<Survey[]>([]);
  const [publicSurveys, setPublicSurveys] = useState<Survey[]>([]);

  const createSurvey = async () => {
    const query = `
      mutation CreateSurvey {
        createSurvey {
          success
          message
        }
      }
    `;
    try {
      const result = await sendGraphQLQuery(query, {});
      if (result.data.createSurvey.success) {
        if (isClicked) {
          setIsClicked(false);
        } else {
          setIsClicked(true);
        }
      } else {
        console.log(result.data.createSuvey.message)
      }
    } catch (error) {
      console.error('새 설문지 생성 실패:', error);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    const query = `
      mutation DeleteSurvey($surveyId: String!) {
        deleteSurvey(surveyId: $surveyId) {
          success
          message
        }
      }
    `;

    const variables = { surveyId };

    try {
      const result = await deleteGraphQLQuery(query, variables);
      if (result.data.deleteSurvey.success) {
        if (isClicked) {
          setIsClicked(false);
        } else {
          setIsClicked(true);
        }
      }
      
    } catch (error) {
        console.error(`설문지 ${surveyId} 삭제 실패.`);
    }
  };

  useEffect(() => {
    
    const getMySurvey = async () => {
    const query = `
      query GetMySurvey {
        getMySurvey {
          success
          message
          surveys {
            s_id
            title
          }
        }
      }
    `;
    try {
      const result = await getGraphQLQuery({ query });
      const mySurveysData = result.data.getMySurvey.surveys || [];
      setMySurveys(mySurveysData);
    } catch (error) {
      console.error('나의 설문지 가져오기 실패:', error);
    }
    };

    const getPublicSurvey = async () => {
      const query = `
        query GetPublicSurvey {
          getPublicSurvey {
            success
            message
            surveys {
              s_id
              title
            }
          }
        }
      `;
      try {
        const result = await getGraphQLQuery({ query });
        const publicSurveysData = result.data.getPublicSurvey.surveys || [];
        setPublicSurveys(publicSurveysData);
      } catch (error) {
        console.error('나의 설문지 가져오기 실패:', error);
      }
    };
    
    getMySurvey();
    getPublicSurvey();
  },[isClicked])

  return (
    <main className='main flex-col w-full min-h-[1400px] p-[30px] pt-[90px] text-center bg-[#e5ccbe]'>
      {
        accessToken &&
        <div className='my-[20px]'>
          <span className='font-bold text-[22px]'>내가 만든 설문지</span>
        </div>
      }
      {
        accessToken && 
      <div className='cardsDiv flex items-start justify-start flex-wrap gap-[30px] w-full min-h-[300px] shadow-sm shadow-slate-400 rounded-md p-[30px] mt-[20px] bg-white'>
        { mySurveys.map((survey) => (
          <div key={survey.s_id} className='w-[250px] h-[150px]'>
            <Link href={`/mysurvey/${survey.s_id}`}>
              <button
                className='buttonDiv flex flex-col items-center justify-center w-full h-full rounded-lg shadow-md shadow-slate-400 text-[16px] hover:text-[18px] hover:bg-slate-300 transition-all'
              >
                <span>{survey.title}</span>
              </button>
            </Link>
            <button
              onClick={() => deleteSurvey(survey.s_id)}
              className='absolute flex flex-col items-center justify-center translate-x-[235px] translate-y-[-160px]  w-[30px] h-[30px] rounded-full bg-green-300 hover:bg-green-500'>
              <FontAwesomeIcon icon={faX} className='w-[40%]'/>
            </button>
          </div>
        ))}
        
        <button
          onClick={createSurvey}
          className='newCardDiv flex flex-col items-center justify-center w-[250px] h-[150px] rounded-lg shadow-md shadow-slate-400 text-[55px] hover:text-[70px] hover:bg-slate-300 transition-all'>
          <span>+</span>
        </button>
      </div>
      }
      <div className='my-[20px]'>
        <span>
          <FontAwesomeIcon icon={faClipboard} className='w-[20px]'/>
        </span>
        <span className='font-bold text-[22px] ml-[10px]'>참여하는 설문지</span>
      </div>
      <div className='cardsDiv flex items-start justify-start flex-wrap gap-[30px] w-full h-[300px] shadow-sm shadow-slate-400 rounded-md p-[30px] mt-[20px] bg-white'>
        { publicSurveys.map((survey) => (
          <div key={survey.s_id} className='w-[250px] h-[150px]'>
            <Link href={`/pushedsurvey/${survey.s_id}`}>
              <button
                className='buttonDiv flex flex-col items-center justify-center w-full h-full rounded-lg shadow-md shadow-slate-400 text-[16px] hover:text-[18px] hover:bg-slate-300 transition-all'
              >
                <span>{survey.title}</span>
              </button>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
