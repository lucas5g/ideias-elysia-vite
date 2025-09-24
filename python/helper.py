import requests 
import pandas as pd 
import streamlit as st

# API_URL = 'https://api.dizelequefez.com.br'
API_URL = 'http://localhost:3000'


def get_phrases(search=None):  
  res = requests.get(f'{API_URL}/phrases?search={search}')
  return res.json()
  
def create_phrase(payload, audio): 
  
  if audio:
    # payload['tags'] = 
    st.write(payload)
    res = requests.post(f'{API_URL}/phrases', data=payload, files={'audio': audio})
    print(res.text)
    return 'teste'
    # return res.json()
  
  res = requests.post(f'{API_URL}/phrases', json=payload)
  return res.json()
