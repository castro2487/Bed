sfcc-ci client:auth $OCAPI_CLIENT_ID $OCAPI_SECRET --renew
sfcc-ci client:auth:renew
echo "#######################"
echo "   prepare site import folder       "
echo "#######################"
mkdir site-import
cp -r sandboxes_alignment/. site-import #modificare questo
zip -q -r site-import.zip site-import
echo "#######################"
echo "   launch site import        "
echo "#######################"
for singleEnv in $(echo $ENV_TO_ALIGN | sed "s/,/ /g")
do
    echo "launching site import on sandbox $singleEnv"
    sfcc-ci instance:upload site-import.zip -i $singleEnv
    sfcc-ci instance:import site-import.zip -i $singleEnv
done
rm site-import.zip
rm -rf site-import