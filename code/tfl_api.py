import pandas as pd
import requests
import warnings
warnings.filterwarnings('ignore')

def get_status(railway: str = "tube") -> pd.DataFrame:
    
    request_object = requests.get(f"https://api.tfl.gov.uk/line/mode/{railway}/status").json()
    df = pd.DataFrame(columns=["Line","statusSeverityDescription","reason"])
    for i in range(len(request_object)):
        df.loc[i, 'Line'] = request_object[i].get('name')
        df.loc[i, 'statusSeverityDescription'] =request_object[i].get('lineStatuses')[0].get('statusSeverityDescription')
        df.loc[i, 'reason'] =request_object[i].get('lineStatuses')[0].get('reason', 'Good Service')
    return df

def construct_tfl_status() -> str:
    df = pd.DataFrame(columns=["Line","statusSeverityDescription","reason"])
    railway_list = ["tube", "dlr"]
    for railway in railway_list:
        temp_df = get_status(railway)
        df = pd.concat([df, temp_df], axis=0, ignore_index=True)
    data = df.to_json(orient='records', indent=4)
    return data

if __name__ == "__main__":
    construct_tfl_status()