import requests 
import pandas as pd 



def get_phrases(search=None):  
  res = requests.get(f'https://api.dizelequefez.com.br/phrases?search={search or ""}')
  return res.json()
  