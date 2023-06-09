// These are the components we want the backend to have access to

// Images and videos
export { Image } from './containers/Image/Image';
export { VideoBlock } from './containers/VideoBlock/VideoBlock';
export { AccessoryImage } from './containers/AccessoryImage/AccessoryImage';
export { ColorsImage } from './containers/ColorsImage/ColorsImage';
export { VideoList } from './containers/VideoList/VideoList';

// Call to ACTIONS
export { LargeCTA } from './containers/callToActions/LargeCTA/LargeCTA';
export { BannerCTA } from './containers/callToActions/BannerCTA/BannerCTA';
export { BookBedTestCTA } from './containers/callToActions/BookBedTestCTA/BookBedTestCTA';
export { RequestCatalogCTA } from './containers/callToActions/RequestCatalogCTA/RequestCatalogCTA';
export { LargeCTAWithSmallText } from './containers/callToActions/LargeCTAWithSmallText/LargeCTAWithSmallText';
export { ZoomCTA } from './containers/callToActions/ZoomCTA/ZoomCTA';
export { FullwidthCTA } from './containers/callToActions/FullwidthCTA/FullwidthCTA';
export { default as WaitListCTA } from './containers/callToActions/WaitListCTA/WaitListCTA';
export { default as SupremeCTA } from './containers/callToActions/SupremeCTA/SupremeCTA';

// Text stories
export { LargeTextStory } from './containers/textStories/LargeTextStory/LargeTextStory';
export { SmallTextStory } from './containers/textStories/SmallTextStory/SmallTextStory';
export { HeritageTextStory } from './containers/textStories/HeritageTextStory/HeritageTextStory';
export { PTextHistory } from './containers/textStories/PTextHistory/PTextHistory';
export { MaterialsTextStory } from './containers/textStories/MaterialsTextStory/MaterialsTextStory';
export { ImageTextStory } from './containers/textStories/ImageTextStory/ImageTextStory';
export { ImageTextStory2 } from './containers/textStories/ImageTextStory2/ImageTextStory2';
export { ThreeSplitTextStory } from './containers/textStories/ThreeSplitTextStory/ThreeSplitTextStory';

// Forms
export { RequestCatalog } from './containers/forms/RequestCatalog/RequestCatalog';
export { RequestCatalog2 } from './containers/forms/RequestCatalog2/RequestCatalog2';
export { RequestCatalog3 } from './containers/forms/RequestCatalog3/RequestCatalog3';
export { default as RequestCatalog4 } from './containers/forms/RequestCatalog4/RequestCatalog4';
export { BookBedTest } from './containers/forms/BookBedTest/BookBedTest';
export { BookBedTest2 } from './containers/forms/BookBedTest2/BookBedTest2';
export { default as BookBedTest3 } from './containers/forms/BookBedTest3/BookBedTest3';
export { VideoSubscription } from './containers/forms/VideoSubscription/VideoSubscription';
export { BedConfigurator } from './containers/forms/BedConfigurator/BedConfigurator';
export { PartnerSignUp } from './containers/forms/PartnerSignUp/PartnerSignUp';
export { Newsletter } from './containers/forms/Newsletter/Newsletter';
export { InteriorDesignCollaborations } from './containers/forms/InteriorDesignCollaborations/InteriorDesignCollaborations';
export { RestoreSignup } from './containers/forms/RestoreSignup/RestoreSignup';
export { default as WaitList } from './containers/forms/WaitList/WaitList';
export { default as CatalogPopup } from './containers/forms/CatalogPopup/CatalogPopup';

// Designers
export { DesignerHero } from './containers/designers/DesignerHero/DesignerHero';
export { DesignerCTA } from './containers/designers/DesignerCTA/DesignerCTA';
export { DesignerBanner } from './containers/designers/DesignerBanner/DesignerBanner';
export { DesignerTextStory } from './containers/designers/DesignerTextStory/DesignerTextStory';

// New business development
export { IntroductionText } from './containers/newBusinessDevelopment/IntroductionText/IntroductionText';
export { InvestText } from './containers/newBusinessDevelopment/InvestText/InvestText';
export { PartnerSlide } from './containers/newBusinessDevelopment/PartnerSlide/PartnerSlide';

// Other
export { AnimatedHeader } from './containers/AnimatedHeader/AnimatedHeader';
export { SpaceHolder } from './containers/SpaceHolder/SpaceHolder';
export { BedColorViewer } from './containers/BedColorViewer/BedColorViewer';
// export { News } from './containers/News/News';
// export { NewsTile } from './containers/NewsTile/NewsTile';
export { NewsTile2 } from './containers/NewsTile2/NewsTile2';
export { BedTile } from './containers/BedTile/BedTile';
export { GVBedTile } from './containers/GVBedTile/GVBedTile';
export { TextBox } from './containers/TextBox/TextBox';
export { ShopHeader } from './containers/ShopHeader/ShopHeader';
export { default as SupremeCampaign } from './containers/SupremeCampaign/SupremeCampaign';

// Partner Pages
export { StoreInfo } from './containers/partnerPages/StoreInfo';
export { PartnerPageDescription } from './containers/partnerPages/PartnerPageDescription';
export { PartnerPageExternalLink } from './containers/partnerPages/PartnerPageExternalLink';
export { PartnerPageFloatingBar } from './containers/partnerPages/PartnerPageFloatingBar';
export { PartnerPageTeam } from './containers/partnerPages/PartnerPageTeam';
export { PartnerPageSlideShow } from './containers/partnerPages/PartnerPageSlideShow';
export { PartnerSlider } from './containers/partnerPages/PartnerSlider';
export { default as PartnerPagePrivateSession } from './containers/partnerPages/PartnerPagePrivateSession/PartnerPagePrivateSession';

// Winter campaign
export { default as WinterCampaignHero } from './containers/winterCampaign/WinterCampaignHero';
export { default as WinterCampaignCTA } from './containers/winterCampaign/WinterCampaignCTA';
export { default as WinterCampaignTextStory } from './containers/winterCampaign/WinterCampaignTextStory';
export { default as WinterCampaignRequestCatalog } from './containers/winterCampaign/WinterCampaignRequestCatalog';
export { default as WinterCampaignBookBedTest } from './containers/winterCampaign/WinterCampaignBookBedTest';

// Price increase campaign
export { default as PriceIncreaseCampaignHero } from './containers/priceIncreaseCampaign/PriceIncreaseCampaignHero';
export { default as PriceIncreaseCampaignBedInfo } from './containers/priceIncreaseCampaign/PriceIncreaseCampaignBedInfo';
export { default as PriceIncreaseCampaignRequestCatalog } from './containers/priceIncreaseCampaign/PriceIncreaseCampaignRequestCatalog';
export { default as PriceIncreaseCampaignBookBedTest } from './containers/priceIncreaseCampaign/PriceIncreaseCampaignBookBedTest';

// Dremer campaign
export { default as DremerCampaignBeddings } from './containers/dremerCampaign/DremerCampaignBeddings';
export { default as DremerCampaignHero } from './containers/dremerCampaign/DremerCampaignHero';
export { default as DremerCampaignHero2 } from './containers/dremerCampaign/DremerCampaignHero2';
export { default as DremerCampaignQuote } from './containers/dremerCampaign/DremerCampaignQuote';
export { default as DremerCampaignFabrics } from './containers/dremerCampaign/DremerCampaignFabrics';
export { default as DremerCampaignHeadboards } from './containers/dremerCampaign/DremerCampaignHeadboards';
export { default as DremerCampaignCTA } from './containers/dremerCampaign/DremerCampaignCTA';
