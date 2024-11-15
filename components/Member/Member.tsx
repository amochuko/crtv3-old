import {
  Flex,
  FormControl,
  FormLabel,
  Link,
  Text,
  VStack,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import { TokenGateContext } from 'collabland-tokengate-react-context';
import { useFormik } from 'formik';
import  * as Yup from 'yup';
import { useContext } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { truncateAddress } from '../../utils/shortenAddress';
import { ROLES } from '../../utils/context';
import CustomInput from '../Input/Input';
import Button from '../Button/Button';
import * as S from '../Content/Content.styled';

const defaultRules = {
    type: 'ERC721',
    chainId: 11155111, // Sepolia
    minToken: '1',
    contractAddress: ROLES.sepolia.test.address, // NFT contract address
    roleId: ROLES.sepolia.test.role, // NFT role id
};

const RulesValidationSchema = Yup.object().shape({
    type: Yup.string().required('Required'),
    chainId: Yup.number().required('Required'),
    minToken: Yup.number().positive().required('Required'),
    contractAddress: Yup.string().required('Required'),
    roleId: Yup.string().required('Required'),
});

const Member = () => {
    const activeAccount = useActiveAccount();
    const { checkRoles, isLoading, result, error } = useContext(TokenGateContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const formik = useFormik({
        initialValues: {
          address: activeAccount?.address,
          chainId: defaultRules.chainId,
          type: defaultRules.type,
          contractAddress: defaultRules.contractAddress,
          minToken: defaultRules.minToken,
          roleId: defaultRules.roleId,
        },
        onSubmit: (values) => {
          checkRoles(
            {
              account: values.address!,
              rules: [
                {
                  type: values.type!,
                  chainId: values.chainId!,
                  minToken: values.minToken!,
                  contractAddress: values.contractAddress!,
                  roleId: values.roleId,
                },
              ],
            },
            process.env.NEXT_PUBLIC_COLLAB_LAND_API_KEY!
          );
        },
        validationSchema: RulesValidationSchema,
      });
    
      return (
        <>
          <Flex
            direction={['column', 'column', 'column', 'row']}
            gap={20}
            className="pt-24 pb-3 mx-auto"
            alignItems="flex-start"
            justifyContent="center"
            maxW="1500px"
          >
            <S.WebGraphic
                src="/web_graphic.gif"
                width={450}
                height={550}
                alt="Creative mascot"
              />
            <VStack width="424px" ml="40px">
              <VStack alignItems="flex-start">
                <Text fontSize={'3xl'} fontWeight={'normal'} color={'#EC407A'}>
                  Wallet Connected
                </Text>
                <Text fontSize="md">
                  The form is populated with your wallet address, and data to check
                  the wallet for <Link href='https://creativeplatform.xyz/blog'>1 Creative Membership Pass</Link> on Polygon.
                  <br />
                </Text>
                <Text fontSize="md" pb="4">
                  Keep, or adjust the inputs, then click &apos;Check Role&apos; to validate your
                  assets and obtain access.
                </Text>
              </VStack>
              
              <form onSubmit={formik.handleSubmit} className="w-full">
                <VStack spacing={4} align="flex-start">
                  <FormControl isRequired>
                    <FormLabel htmlFor="address" fontSize="sm">
                      Wallet Address
                    </FormLabel>
                    <CustomInput
                      id="address"
                      name="address"
                      type="string"
                      placeholder="Enter Wallet Address"
                      onChange={formik.handleChange}
                      value={formik.values.address}
                      isDisabled={isLoading}
                      variant="filled"
                      marginBottom={4}
                    />
                    <FormLabel htmlFor="chainId" fontSize="sm">
                      Chain Id
                    </FormLabel>
                    <CustomInput
                      id="chainId"
                      name="chainId"
                      type="number"
                      placeholder="Enter Chain ID"
                      onChange={formik.handleChange}
                      value={formik.values.chainId}
                      isDisabled={isLoading}
                      variant="filled"
                      marginBottom={4}
                    />
                    <FormLabel htmlFor="type" fontSize="sm">
                      Token Type
                    </FormLabel>
                    <CustomInput
                      id="type"
                      name="type"
                      type="text"
                      placeholder="Enter Token Type"
                      onChange={formik.handleChange}
                      value={formik.values.type}
                      isDisabled={isLoading}
                      variant="filled"
                      marginBottom={4}
                    />
                    <FormLabel htmlFor="contractAddress" fontSize="sm">
                      Token Contract Address
                    </FormLabel>
                    <CustomInput
                      id="contractAddress"
                      name="contractAddress"
                      type="address"
                      placeholder="Enter Token Contract Address"
                      onChange={formik.handleChange}
                      value={formik.values.contractAddress}
                      isDisabled={isLoading}
                      variant="filled"
                      marginBottom={4}
                    />
                    <FormLabel htmlFor="minToken" fontSize="sm">
                      Minimum Tokens in Wallet
                    </FormLabel>
                    <CustomInput
                      id="minToken"
                      name="minToken"
                      type="string"
                      placeholder="Enter Minimum Tokens in Wallet"
                      onChange={formik.handleChange}
                      value={formik.values.minToken}
                      isDisabled={isLoading}
                      variant="filled"
                      marginBottom={4}
                    />
                  </FormControl>
                    <Button
                      type="submit"
                      width="fit-content"
                      isLoading={isLoading}
                      paddingX={10}
                    >
                      Check Role
                    </Button>
                </VStack>
              </form>
              {error && <div className="font-bold text-red-900">Error: {error}</div>}
            </VStack>
            <VStack
              align="flex-start"
              alignItems="flex-start"
              width="296px"
              spacing="72px"
              paddingTop="52px"
            >
              <VStack alignItems="flex-start" gap={0} fontSize="md">
                <Link
                  className="underline"
                  href="https://app.creativeplatform.xyz"
                  target="_blank"
                >
                  Creative Terminal
                </Link>
                <Link
                  className="underline"
                  href="https://creativeplatform.xyz/blog"
                  target="_blank"
                >
                  Membership Pricing
                </Link>
              </VStack>
              {result?.roles?.[0] && (
                <div>
                  <Text
                    fontSize="3xl"
                    mb={3}
                    color={
                      result.roles[0].granted ? 'general.success' : 'general.error'
                    }
                  >
                    Access {result.roles[0].granted ? 'Granted' : 'Denied'}
                  </Text>
      
                  <Text>Data sent:</Text>
                  <pre
                  // style={{
                  //   fontFamily: 'mPlus1Code',
                  //   fontWeight: '400',
                  // }}
                  >
                    {JSON.stringify(
                      {
                        ...formik.values,
                        address: truncateAddress(formik.values.address!),
                        contractAddress: truncateAddress(
                          formik.values.contractAddress
                        ),
                      },
                      undefined,
                      4
                    )}
                  </pre>
                  { result.roles[0].granted ? 
                    <Button onClick={onOpen}>
                    Creative TV Menu
                  </Button> : <Link
                      href="https://app.unlock-protocol.com/checkout?id=1505d0df-b86c-4171-80d5-da502a081db7"
                      target="_blank"
                    >
                      <Button my={4}>Purchase A Membership Pass</Button>
                    </Link>
                  }
                  <Drawer placement={'left'} onClose={onClose} isOpen={isOpen}>
                    <DrawerOverlay />
                    <DrawerContent>
                      <DrawerHeader borderBottomWidth='1px'>Creative TV Menu</DrawerHeader>
                      <DrawerBody>
                        <Link href={`/profile/${activeAccount?.address}`}>My Profile</Link>
                        <p>Upload</p>
                      </DrawerBody>
                    </DrawerContent>
                  </Drawer>
                </div>
              )}
            </VStack>
          </Flex>
        </>
    );
};    

export default Member;