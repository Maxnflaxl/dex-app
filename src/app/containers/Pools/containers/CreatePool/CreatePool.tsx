import React, {useCallback, useEffect, useState} from "react";
import "./index.scss";
import { AssetsContainer, Button, Section, Title, Window, Container } from "@app/shared/components";
import {useDispatch, useSelector} from "react-redux";
import {
  selectAssetsList,
  selectOptions,
  selectPoolsList,
  selectTxStatus
} from "@app/containers/Pools/store/selectors";
import Select from 'react-select'
import { ICreatePool, TxStatus} from "@core/types";
import { kindSelect, ROUTES_PATH, titleSections } from "@app/shared/constants";
import {useNavigate} from "react-router-dom";
import * as mainActions from "@app/containers/Pools/store/actions";
import { styled } from "@linaria/react";

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   margin: 50px 0;
//   width: 100%;
//   min-height: 600px;
//   height: 100%;
//   justify-content: space-between;
// `;


export const CreatePool = () => {
  const assetsList = useSelector(selectAssetsList());
  const poolsList = useSelector(selectPoolsList());
  const txStatus = useSelector(selectTxStatus());
 const options = useSelector(selectOptions())
  const [options2pair, setOptions2Pair] = useState([])
  const [currentToken1, setCurrentToken1] = useState(null);
  const [currentToken2, setCurrentToken2] = useState(null);
  const [currentKind, setCurrentKind] = useState(2);
  const [isValidate, setIsValidate] = useState(false);

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const requestData: ICreatePool[] = [{
    aid1: currentToken1,
    aid2 :currentToken2,
    kind: currentKind
  }]

  const addLiquidityNavigation = useCallback((data) => {
    dispatch(mainActions.setCurrentPool(data))
    navigate(ROUTES_PATH.POOLS.ADD_LIQUIDITY);
  }, [navigate]);

  useEffect(()=>{
    if(txStatus && txStatus === TxStatus.Completed){
      let newPool
      poolsList.filter(item => {
        if(item.aid1 === requestData[0].aid1 && item.aid2 === requestData[0].aid2 && item.kind === requestData[0].kind){
          newPool = item
        }
      })
      addLiquidityNavigation(newPool)
    }
  },[txStatus])
  const getOptionsSecondPare = (lists, value: number) =>{
    if(lists && value || value === 0){
        setOptions2Pair(lists.filter((item) => item.value > value))
    }
    return  lists
  }

  const getKindValue = () => {
    return  kindSelect.find((elem) => elem.value === currentKind);
  }

  useEffect(()=>{
    getOptionsSecondPare(options, currentToken1)
  },[ currentToken1])

  const onChangeToken1 = ( newValue) => {
    setCurrentToken1(newValue.value)
  }
  const onChangeToken2 = (newValue ) => {
    setCurrentToken2(newValue.value)
  }
  const onChangeKind = ( newValue) => {
    setCurrentKind(newValue.value)
  }

 const checkValidate = () => {
    requestData.map(item=> {
      if(item.aid1 !== null && item.aid2 !== null && item.kind !== null){
        return setIsValidate(true)
      }
      setIsValidate(false)
    })
 }
  useEffect(()=>{
    checkValidate()
  },[requestData])

  const onCreatePool =  (data: ICreatePool[]) => {
    dispatch(mainActions.onCreatePool.request(data))
  }

  return (
    <Window title='Create pool' backButton>
      <Container>
        <AssetsContainer>
          <Section title={titleSections.CREATE_FIRST}>
            <Select  classNamePrefix="custom-select"
                     options={options}
                     isSearchable
                     onChange={onChangeToken1}
            />
          </Section>
          <Section title={titleSections.CREATE_SECOND}>
          <Select classNamePrefix="custom-select"
              options={options2pair}
              onChange={onChangeToken2}
      />
          </Section>
        </AssetsContainer>

        <Section title={titleSections.FEE}>
          <div className="fees-wrapper">
            <div className="information">
              Fee tier indicates the liquidity of the pool assets. It is
              recommended to use low tier for stable assets only.
            </div>
            <Select
                classNamePrefix="custom-select"
                options={kindSelect} placeholder='Select fee'
                value={getKindValue()}
                onChange={onChangeKind}
            />
          </div>
        </Section>

        <div className="button-wrapper">
          <Button  onClick={()=>onCreatePool(requestData)} disabled={!isValidate}>Create Pool</Button>
        </div>
      </Container>
      </Window>
  );
};
