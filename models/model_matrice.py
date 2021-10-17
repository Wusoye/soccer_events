import pymongo
import json
import bson
import numpy as np
import pandas as pd
from bson.objectid import ObjectId
from bson import json_util

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
import math
import sys

myclient = pymongo.MongoClient("mongodb://127.0.0.1:27017/")
mydb = myclient["soccer_event"]
mycol = mydb["matrice_detail"]

myquery = { "_id" : "6160c05590577726bcfeeb49" }

def parse_json(data):
    return json.loads(json_util.dumps(data))

data = parse_json(mycol.find_one())["data"]

winner = pd.DataFrame()
matrice_detail = pd.DataFrame()
md_to_w = pd.DataFrame()

for x in range(len(data)):
    winner.loc[x, 'winner'] = data[x]['winner']
    
    matrice_detail.loc[x, 'av1'] = data[x]['matrice'][0][0]
    matrice_detail.loc[x, 'avN'] = data[x]['matrice'][0][1]
    matrice_detail.loc[x, 'av2'] = data[x]['matrice'][0][2]
    matrice_detail.loc[x, 'ma1'] = data[x]['matrice'][1][0]
    matrice_detail.loc[x, 'maN'] = data[x]['matrice'][1][1]
    matrice_detail.loc[x, 'ma2'] = data[x]['matrice'][1][2]
    matrice_detail.loc[x, 'mi1'] = data[x]['matrice'][2][0]
    matrice_detail.loc[x, 'miN'] = data[x]['matrice'][2][1]
    matrice_detail.loc[x, 'mi2'] = data[x]['matrice'][2][2]

X = matrice_detail
y = winner
y = np.array(y).reshape(len(y),)

model = LogisticRegression(C=10, penalty='l2', solver='saga', multi_class='ovr', max_iter=10000)
#model = KNeighborsClassifier(n_neighbors = 5)
model.fit(X, y)

def fixed(model, av1,  avN,  av2,  ma1,  maN,  ma2,  mi1,  miN,  mi2):
    
    x = np.array([av1,  avN,  av2,  ma1,  maN,  ma2,  mi1,  miN,  mi2]).reshape(1,9)

    #scaler.transform(x)
    
    #print(model.predict(x))
    proba = model.predict_proba(x)[0]
    proba_1 = round(proba[0]*100, 2)
    proba_X = round(proba[1]*100, 2)
    proba_2 = round(proba[2]*100, 2)
    
    #print('1:', proba_1, 'X:', proba_X, '2:', proba_2)
    
    return [proba_1, proba_X, proba_2]





result = fixed(model, av1=1,  avN=1,  av2=1,  ma1=1,  maN=1,  ma2=1,  mi1=1,  miN=1,  mi2=1)

print(result[0],result[1],result[2])
sys.stdout.flush()
