echo "#######################"
echo "   compile packages       "
echo "#######################"
echo "npm install"
npm install
echo "Compile SFRA"
npm run scripts:app_hastens
npm run css:app_hastens
echo "Compile Hastens"
npm run build:prod
echo "Compile Hastens Storelocator"
npm run scripts:int_hastens_storelocator
CODE_VERSION=`date "+%Y%m%d%H%M%S"`
echo "#######################"
echo "       deploy          "
echo "#######################"
sfcc-ci client:auth $OCAPI_CLIENT_ID $OCAPI_SECRET --renew
sfcc-ci client:auth:renew
cd cartridges #enter in cartridge folder to zip all of them
mkdir ${CODE_VERSION}
for dir in ./* ;do
    if [[ -d $dir ]];then
        if [[ ! ${dir:2} =~ ^(gulp|node_modules|configurations|configuration|customer_service_center|$CODE_VERSION)$ ]]
        #Test only: upload only one cartridge
        #if [[ ${dir:2} =~ ^(app_hastens)$ ]]
        then
            echo "Creating version .zip package for cartridge ${dir##*/}..."
            cp -R ${dir##*/} ${CODE_VERSION}/${dir##*/}

            zip -q -r ${CODE_VERSION}.zip ${CODE_VERSION}

            echo "Uploading cartridge ${dir##*/} to ${CODE_VERSION}..."

            sfcc-ci code:deploy ${CODE_VERSION}.zip -i $ENV_DEPLOY
            echo "Cartridge ${dir##*/} uploaded."

            echo "Cleaning after upload..."
            rm -rf ${CODE_VERSION}/${dir##*/}
            rm ${CODE_VERSION}.zip

        fi
    fi
done

rm -rf ${CODE_VERSION}

#sfcc-ci code:activate ${CODE_VERSION} -i $ENV_DEPLOY