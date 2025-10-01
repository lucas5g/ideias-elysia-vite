import streamlit as st  
from helper import get_phrases, create_phrase

st.set_page_config(page_title="Ideias", page_icon=":idea:", layout="wide")
st.header('Ideias')

list, form = st.tabs(['List', 'Form'])

with form:
  # with st.form('Form'):   
  payload = {}
  audio = None
  payload['type'] = st.selectbox('Type', ('TRANSLATION', 'NEGATIVE', 'INTERROGATIVE', 'STORY'))
  if payload['type'] == 'TRANSLATION':
    payload['portuguese'] = st.text_input('Portuguese', placeholder="Portuguese", key='portuguese' )    
  
  if payload['type'] == 'NEGATIVE' or payload['type'] == 'INTERROGATIVE':
    audio = st.file_uploader('Audio', type=['ogg', 'mp3'])             
      
  payload['tags'] =  [st.text_input('Tags', placeholder="Tags", key='tags')]
  
  if st.button('Save'):  
    res = create_phrase(payload, audio)
    if 'id' in res:
      st.success('Phrase created')
    else:      
      st.warning(res['message'])
          

with list:
  search = st.text_input('test', placeholder="Portuguese, English and Tags", )
  st.button('Search')
  

  for row in get_phrases(search=search):
    tags = ''
    for tag in row['tags']:
      tags += f'`{tag}` '
    
    st.markdown(f'''
      ###### {row["english"]}     
      {row["portuguese"]}
      
      {tags}
    ''')
    
    st.audio(row['audioUrl'])
    st.divider()
