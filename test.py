import uuid
import requests

url = "https://p-cmwnext.movetv.com/pg/v1/my_tv_tvod?timezone=-0500&dma=501&product=sling&platform=browser"

headers = {
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiIxNDcwYTg1ZC00OTg4LTQ0YjItYTY3ZC05NmYyZDI5NGY3ZjkiLCJpYXQiOjE1ODcyODY4ODAsImlzcyI6IkNNVyIsInBsYXQiOiJicm93c2VyIiwicHJvZCI6InNsaW5nIiwic3ViIjoiNDZmZmJiNjAtNTYyZS0xMWVhLTg2MmMtMGE4Yjc2ZGE2M2QxIn0.6DMOFI8vfPQUSqV-BK_5JccNCNA5PzLU71x49nCp1VM',
    'client-config': 'browser_1.3.0',
    'features': 'use_ui_4=false,paging=undefined,happy_hour=false',
    'origin': 'https://watch.sling.com',
    'referer': 'https://watch.sling.com/browse/my-tv/edit-channels',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'sling-interaction-id': str(uuid.uuid1()),
    'time-zone-id': 'Asia/Calcutta',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
}
headers['authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJmMTY2YWYzYy02NGFlLTQ3MmMtOTY5MC02MjVlZDc2NDU0OWQiLCJpYXQiOjE1ODcyOTA0MTMsImlzcyI6IkNNVyIsInBsYXQiOiJicm93c2VyIiwicHJvZCI6InNsaW5nIiwic3ViIjoiOGUyNDllZWUtODIyNC0xMWVhLWIyNDgtMGFjY2YzMzE4ZDE5In0.0_49H6YuT9WmWahyXDxAEtUl6nLpV6EmUe_NSrdxdHc'

resp = requests.get(url, headers=headers).json()

for i in resp['ribbons']:
    print(i['title'])
